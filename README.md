# 🎹 Podcast Script & TTS Agent (OpenServ)

This OpenServ agent generates structured podcast scripts from a topic and converts the script into a multi-speaker audio file using different TTS voices. It also merges and uploads the final audio to your OpenServ workspace.

---

## 📦 Project Description

This project demonstrates how to build a multi-capability OpenServ agent using:

- OpenAI's GPT-4o for generating structured podcast scripts
- OpenAI TTS (text-to-speech) for converting scripts into realistic voices
- FFmpeg for merging audio files
- OpenServ SDK for running, managing, and uploading files

### 💡 Example Use Case

> "Generate a podcast about AI trends in 2025"

🎧 Output: An MP3 podcast with different voice actors representing speakers.

---

## 🧠 Capabilities

### `generate_podcast_script`

- **Input:** Podcast script
- **Output:** JSON with dialogues per speaker, converted using OpenAI's GPT-4o model
- **Model Used:** `gpt-4o`

### `textToSpeech`

- **Input:** JSON with speaker/dialogue pairs
- **Output:**
  - Individual MP3 files for each line
  - Final merged podcast `podcast.mp3`
  - Upload to OpenServ workspace via `agent.uploadFile`

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ardatricity/dualvoice-podcast-agent.git
cd dualvoice-podcast-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key
OPENSERV_API_KEY=your_openserv_api_key
```

### 4. Install FFmpeg

Ensure FFmpeg is installed and accessible from your CLI.

- macOS: `brew install ffmpeg`
- Ubuntu: `sudo apt install ffmpeg`
- Windows: [Download FFmpeg](https://ffmpeg.org/download.html) and add to PATH

---

## 🧪 Testing the Agent

Run the agent:

```bash
npm run dev
```

The `main()` function will:

1. Call `generate_podcast_script` with the topic `AI trends in 2025`
2. Parse the JSON response
3. Pass the dialogues to `textToSpeech`
4. Merge the audio and upload the final podcast file (`podcast.mp3`) to OpenServ

---

## License

[MIT](https://choosealicense.com/licenses/mit/)  

---
