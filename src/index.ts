import { z } from 'zod';
import { Agent } from '@openserv-labs/sdk';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import ffmpeg from 'fluent-ffmpeg';  

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// List of different voice model names (e.g. ElevenLabs)
const voices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer'];

// Function to merge all audio files into one
function combineMp3Files(audioFiles: string[], outputFile: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // Add all MP3s in order as input
    audioFiles.forEach(file => {
      command = command.input(file);
    });

    command
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('Birleştirme tamamlandı:', outputFile);
        resolve(outputFile);
      })
      .mergeToFile(outputFile, __dirname);
  });
}

// Create the agent
const agent = new Agent({
  systemPrompt: "You are an AI agent that creates structured podcast scripts with multiple speakers. Use the user's topic as the foundation."
});

// 1) Capability to generate a podcast script in JSON format
agent.addCapability({
  name: 'generate_podcast_script',
  description: 'Generate structured JSON podcast script with multiple speakers based on a topic',
  schema: z.object({ topic: z.string() }),
  async run({ args }) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Create a structured podcast script in JSON format with dialogues clearly separated by speaker names. 
                    Minimum two speakers. 
                    Output format: {"dialogues":[{"speaker":"speaker1","dialogue":"xxx"},{"speaker":"speaker2","dialogue":"xxx"}]}`
        },
        { role: 'user', content: args.topic }
      ]
    });

    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content ?? '';
  }
});

// 2) Capability to convert dialogs to speech and merge them into one file
agent.addCapability({
  name: 'textToSpeech',
  description: 'Convert dialogues into audio segments, assign different voices per speaker, and merge into a single MP3 file.',
  schema: z.object({
    dialogues: z.array(z.object({
      speaker: z.string(),
      dialogue: z.string()
    }))
  }),
  async run({ args, action }) {
    // Check if action and workspaceId are available
    // if (!action || !action.workspace || !action.workspace.id) {
    //  throw new Error('Action context or Workspace ID is missing. Cannot upload file.');
    //}

    const dialogueAudios: string[] = [];
    const speakerVoiceMap: { [key: string]: string } = {};

    // Ensure the same speaker always uses the same voice
    args.dialogues.forEach(({ speaker }, idx) => {
      if (!speakerVoiceMap[speaker]) {
        speakerVoiceMap[speaker] = voices[idx % voices.length];
      }
    });

    // Generate speech for each dialog and save as a file
    for (const { speaker, dialogue } of args.dialogues) {
      const voice = speakerVoiceMap[speaker];
      const audioResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice,
        input: dialogue
      });

      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
      const audioFileName = path.join(__dirname, `${speaker}-${Date.now()}.mp3`);
      fs.writeFileSync(audioFileName, audioBuffer);
      dialogueAudios.push(audioFileName);

      console.log(`Created TTS file for speaker=${speaker}, voice=${voice}: ${audioFileName}`);
    }

    // After the loop, merge all generated MP3s
    const outputFile = path.join(__dirname, 'podcast.mp3');
    await combineMp3Files(dialogueAudios, outputFile);
    
    // Upload the final podcast file into the project
    // I could not test this part on Openserv because of the tunnelling issue with both ngrok and localtunnel.

    // const workspaceId = action.workspace.id;
    // const mergedAudioBuffer = fs.readFileSync(outputFile);
    // await agent.uploadFile({
    //   workspaceId: action.workspace.id,
    //   path: 'audio/podcast.mp3',
    //   file: mergedAudioBuffer
    //});

    // Return JSON showing which speaker got which voice and include the merged file path
    return JSON.stringify({
      speakerVoiceMap,
      dialogueAudios,
      mergedOutput: outputFile
    }, null, 2);
  }
});

// Start the agent
agent.start();

async function main() {
  const scriptResult = await agent.process({
    messages: [{ role: 'user', content: 'Generate a podcast about AI trends in 2025' }]
  });

  console.log('Podcast Script:', scriptResult.choices[0].message.content);
}

main().catch(console.error);
