import { z } from 'zod'
import { Agent } from '@openserv-labs/sdk'
import 'dotenv/config'

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

  console.log('Podcast Script:', podcastScript.choices[0].message.content)
}

main().catch(console.error)
