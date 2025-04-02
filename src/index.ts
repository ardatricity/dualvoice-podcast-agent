import { z } from 'zod';
import { Agent } from '@openserv-labs/sdk';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const voices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer'];

// Create the agent
const agent = new Agent({
  systemPrompt: "You are an AI agent that creates structured podcast scripts with multiple speakers. Use the user's topic as the foundation."
});

// Generate podcast script and convert to JSON
agent.addCapability({
  name: 'generate_podcast_script',
  description: 'Generate structured JSON podcast script with multiple speakers based on a topic',
  schema: z.object({ topic: z.string() }),
  async run({ args }) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Create a structured podcast script in JSON format with dialogues clearly separated by speaker names. Minimum two speakers. Output format: {"dialogues":[{"speaker":"speaker1","dialogue":"xxx"},{"speaker":"speaker2","dialogue":"xxx"},{"speaker":"speaker3","dialogue":"xxx"}]}' },
        { role: 'user', content: args.topic }
      ]
    });
    console.log(completion.choices[0].message.content)
    return completion.choices[0].message.content ?? '';
  }
});

// Convert dialogues to speech and save to podcast.mp3
agent.addCapability({
  name: 'textToSpeech',
  description: 'Convert dialogues into audio segments, assign different voices per speaker, and merge into a single MP3 file.',
  schema: z.object({
    dialogues: z.array(z.object({
      speaker: z.string(),
      dialogue: z.string()
    }))
  }),
  async run({ args }) {
    const dialogueAudios = [];
    const speakerVoiceMap: { [key: string]: string } = {};

    args.dialogues.forEach(({ speaker }, idx) => {
      if (!speakerVoiceMap[speaker]) {
        speakerVoiceMap[speaker] = voices[idx % voices.length];
      }
    });

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
    }

    return JSON.stringify({ speakerVoiceMap, dialogueAudios }, null, 2);
  }
});

// Start the agent
agent.start();

async function main() {
  const result = await agent.process({
    messages: [{ role: 'user', content: 'Generate a podcast about AI trends in 2025' }]
  });

  console.log('Podcast Script:', result.choices[0].message.content);
}

main().catch(console.error);