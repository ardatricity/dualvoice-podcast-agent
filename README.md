# DualVoice Podcast Agent

An **AI-driven** agent that **generates multi-speaker podcast scripts** based on user-provided topics. 

## Features

- **Script Generation**  
  Produces a podcast script containing at least two distinct speakers with different personalities and tones.
- **Structured, Long-Form Dialogue**  
  Ensures a coherent conversation flow spanning ~20+ sentences, concluding naturally.
- **Topic-Focused**  
  Adapts the script to any user-defined topic (e.g., technology, travel, finance).

## Capabilities

### generate_podcast_script
Generates a detailed podcast script based on specified criteria:
- `topic` *(string)* — The subject or theme of the podcast (e.g., “The future of AI”)

The agent responds with a multi-speaker script addressing the specified topic.

## Example Queries

```
"Generate a podcast script about the impact of social media"
"Create a multi-speaker podcast discussing mental health awareness"
"Write a podcast dialogue on space exploration"
```

## Output Format

The agent returns a structured script. For example:

```text
Podcast Script: Here's a podcast script on "The Future of AI":

---

**[Speaker 1: Host - Alex]**
Hello, everyone, and welcome back to "Tech Tomorrow," your favorite podcast ...

**[Speaker 2: Expert - Dr. Jen Lee]**
Hi, Alex! It's great to be here again. AI is such an exciting field ...

...

**[Alex]**
Thank you, Dr. Lee, for joining us and sharing these insights. Until next time, goodbye!
```


## Configuration

- **System prompt** and behavior are defined in your `index.ts`.
- **generate_podcast_script** logic is located within your capability definitions.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to modify. 

## License

[MIT](https://choosealicense.com/licenses/mit/)  

---