import { z } from 'zod'
import { Agent } from '@openserv-labs/sdk'
import 'dotenv/config'
import axios from 'axios'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Create the agent
const agent = new Agent({
  systemPrompt: "You are an AI agent that creates a structured podcast script with at least two distinct speakers. Use the user's topic as the foundation."
})


agent.addCapabilities([{
  // Add generate_podcast_script capability
  name: 'generate_podcast_script',
  description: 'Generates a podcast script with at least 2 speakers based on a topic',
  schema: z.object({
    topic: z.string()
  }),
  async run({ args }) {
    // converting the script into JSON format
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Convert the provided podcast script into JSON format. JSON should clearly separate speaker names and their dialogues.' },
        { role: 'user', content: args.topic }
      ]
    })

    console.log(completion.choices[0].message.content)
    // Ensure a string is returned, even if content is null
    return completion.choices[0].message.content ?? '';
  }
},
// Add convert_script_to_audio capability 
{
  name: 'textToSpeech',
  description: 'Convert text dialogues into audio and then combine them into a single audio file. Use different voices for each speaker. Then save the audio file to a file called "podcast.mp3"',
  schema: z.object({
    dialogues: z.array(z.object({
      speaker: z.string(),
      dialogue: z.string()
    }))
  }),
  async run({ args }) {
    const audioResults = await Promise.all(args.dialogues.map(async ({ speaker, dialogue }, idx) => {
      const audio = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: dialogue
      })

      return {
        speaker,
        audioUrl: audio.url,
        segment: idx + 1
      }
    }))

    return JSON.stringify(audioResults, null, 2)
  }
}])

// Start the agent's HTTP server
agent.start()

async function main() {
  const result = await agent.process({
    messages: [{ role: 'user', content: 'Generate a podcast about AI trends in 2025' }]
  })

  console.log('Podcast Script:', result.choices[0].message.content)
}

main().catch(console.error)