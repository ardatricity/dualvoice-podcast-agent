import { z } from 'zod'
import { Agent } from '@openserv-labs/sdk'
import 'dotenv/config'
import axios from 'axios'

// Create the agent
const agent = new Agent({
  systemPrompt: `You are an AI agent that creates a structured podcast script with at least two distinct speakers, each possessing a unique personality and emotional tone. Use the user’s topic as the foundation, ensuring the dialogue spans at least 20 sentences and concludes naturally. Incorporate warmth, humor, or other emotional nuances where fitting. Provide only the script, and do not include any commentary or additional text beyond it.`
})


// Add generate_podcast_script capability
agent.addCapability({
  name: 'generate_podcast_script',
  description: 'Generates a podcast script with at least 2 speakers based on a topic',
  schema: z.object({
    topic: z.string()
  }),
  async run({ args }) {
    // In a real scenario, you would call an LLM here to generate the script
    return `Podcast script generated for topic: ${args.topic}. [Speaker 1: Hello...] [Speaker 2: Hi...]`
  }
})

// Add convert_script_to_audio capability (basit sürüm)
agent.addCapability({
  name: 'convert_script_to_audio',
  description: 'Converts the entire podcast script into an audio file using ElevenLabs, returning base64.',
  schema: z.object({
    script: z.string()
  }),
  async run({ args }) {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not set in environment.')
    }

    // Basit tek parça TTS: Tüm script tek bir istekle.
    const voiceId = '21m00Tcm4TlvDq8ikWAM' // Örnek: "Rachel"
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`

    const data = {
      text: args.script,
      model_id: 'eleven_multilingual_v2'
    }

    // POST isteği (binary mp3 almak için responseType: 'arraybuffer')
    const response = await axios.post(url, data, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    })

    // MP3 verisini base64 string'e çevir
    const base64Audio = Buffer.from(response.data).toString('base64')
    return `data:audio/mpeg;base64,${base64Audio}`
  }
})

// Start the agent's HTTP server
agent.start()

async function main() {
  const podcastScript = await agent.process({
    messages: [
      {
        role: 'user',
        content: 'Generate a podcast script about the future of AI'
      }
    ]
  })

  const script = podcastScript.choices[0].message.content
  console.log('Podcast Script:', script)

  // 2) Convert that script to audio
  const audioResult = await agent.process({
    messages: [
      {
        role: 'user',
        content: 'Convert the script to audio: ' + script
      }
    ]
  })

  // Agent, MP3'ün base64 halini döndürür
  console.log('Audio (base64):', audioResult.choices[0].message.content)
}

main().catch(console.error)