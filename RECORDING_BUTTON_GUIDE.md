# How the Recording Button Works (STT - Speech-to-Text)

## What is STT?

STT stands for **Speech-to-Text**. The recording button (microphone icon 🎤) in the chat input allows you to dictate your radiology reports instead of typing them.

---

## How to Use the Recording Button

### Step 1: Click the Microphone Button
- Located in the chat input area (bottom of the screen)
- Icon looks like a microphone 🎤

### Step 2: Grant Microphone Permission
- Your browser will ask for permission to access your microphone
- Click **"Allow"** to enable recording
- This permission is only needed once

### Step 3: Start Speaking
- Once recording starts, the button will turn red 🔴
- Speak clearly into your microphone
- The recording timer will show how long you've been recording

### Step 4: Stop Recording
- Click the microphone button again to stop
- The audio will be transcribed to text automatically
- The transcribed text will appear in the chat input field

### Step 5: Review and Send
- Review the transcribed text
- Edit if needed
- Click Send to submit your message

---

## STT Service Options

You can choose which STT service to use in **Settings → TTS**:

### 1. Browser STT (Default, Free)
- ✅ **Runs locally in your browser**
- ✅ **No API key needed**
- ✅ **Works offline** (after first load)
- ✅ **Free**
- ⚠️ Accuracy depends on browser (Chrome works best)
- ⚠️ Limited medical terminology support

**Good for:** Demo, testing, non-critical transcription

---

### 2. OpenAI Whisper (Best Accuracy)
- ✅ **Excellent accuracy**
- ✅ **Good medical terminology support**
- ✅ **Multiple languages** (English, French, Spanish, etc.)
- ⚠️ **Requires OpenAI API key**
- ⚠️ **Sends audio to OpenAI servers** (privacy concern for patient data)
- ⚠️ **Costs money** (per minute of audio)

**Good for:** Demo purposes only (NOT for production with patient data)

---

### 3. Local Whisper (Coming Soon - Recommended for Production)
- ✅ **Best accuracy** (same as OpenAI Whisper)
- ✅ **Complete privacy** (audio never leaves your network)
- ✅ **HIPAA compliant**
- ✅ **No per-minute costs**
- ⚠️ Requires separate Whisper server
- ⚠️ Needs GPU for best performance

**Good for:** Production use with patient data

See `LOCAL_WHISPER_PLAN.md` for implementation details.

---

## Current Configuration

**For this demo, we're using:**
- **OpenAI Whisper** (configured via OpenAI API key)
- This is **NOT suitable** for production with real patient data
- Production deployments **MUST use Local Whisper**

---

## Auto-Stop Feature

In **Settings → TTS**, you can enable "Auto-Stop Recording":

- ✅ **Enabled:** Recording stops automatically after a pause in speech (recommended)
- ❌ **Disabled:** You must click the button again to stop recording

---

## Troubleshooting

### Recording button doesn't work
1. **Check microphone permission:** Browser → Settings → Privacy → Microphone
2. **Check microphone connection:** Make sure your microphone is plugged in
3. **Try a different browser:** Chrome has the best support

### Transcription is inaccurate
1. **Speak clearly** and not too fast
2. **Reduce background noise**
3. **Switch to OpenAI Whisper** (Settings → TTS → STT Service)
4. **Check language setting** (Settings → TTS → STT Service → Language)

### "STT connection error"
1. **Browser STT:** Check microphone permission
2. **OpenAI Whisper:** Check API key in Settings → Provider → OpenAI
3. **Network issues:** Check internet connection

### Medical terms not recognized
- Browser STT has limited medical vocabulary
- **Solution:** Use OpenAI Whisper (demo) or Local Whisper (production)
- Local Whisper can be fine-tuned with medical dictionaries

---

## Privacy & Security

### ⚠️ IMPORTANT: Patient Data Privacy

**For demonstration:**
- OpenAI Whisper is acceptable (no real patient data)

**For production:**
- ❌ **NEVER use OpenAI Whisper** with real patient audio
- ✅ **MUST use Local Whisper** (keeps audio on your servers)
- ✅ Local Whisper is **HIPAA compliant**

### How Browser STT Works
1. Your browser captures audio from microphone
2. Audio is processed by browser's built-in speech recognition
3. Text appears in chat input
4. **No audio leaves your computer**

### How OpenAI Whisper Works
1. Your browser captures audio from microphone
2. Audio is sent to Serenvale server
3. Server forwards audio to OpenAI API
4. OpenAI transcribes and returns text
5. Text appears in chat input
6. ⚠️ **Audio is sent to OpenAI cloud**

### How Local Whisper Works (Production)
1. Your browser captures audio from microphone
2. Audio is sent to Serenvale server
3. Server sends audio to your local Whisper server
4. Whisper transcribes and returns text
5. Text appears in chat input
6. ✅ **Audio never leaves your network**

---

## Best Practices for Radiology Dictation

### 1. Structure Your Dictation
```
"Clinical history: Patient presents with chest pain.
Findings: The lungs are clear. No pleural effusion.
The heart size is normal. No pericardial effusion.
Impression: Normal chest x-ray."
```

### 2. Speak Punctuation
- Say "period" for `.`
- Say "comma" for `,`
- Say "new paragraph" to start a new paragraph

### 3. Spell Out Difficult Terms
- "Patient name is John, spelled J-O-H-N"
- "Accession number A-C-C-1-2-3-4-5"

### 4. Review Before Sending
- **Always review** the transcribed text
- STT is not 100% accurate
- Check for medical term errors

---

## Keyboard Shortcuts

- **Start/Stop Recording:** There's no default hotkey, but you can add one in Settings → Hotkey
- **Send Message:** `Cmd/Ctrl + Enter`
- **Clear Input:** Clear button in chat input

---

## Future Enhancements

### Planned Features:
1. **Real-time transcription** - See text as you speak
2. **Custom medical dictionary** - Add clinic-specific terms
3. **Multi-language support** - English + French simultaneously
4. **Voice commands** - "New paragraph", "Delete that", "Send message"
5. **Transcription confidence scores** - Highlight uncertain words

---

## Questions?

- **Setup issues:** See `BRANDING.md` and `LOCAL_WHISPER_PLAN.md`
- **API configuration:** Settings → Provider → OpenAI
- **STT settings:** Settings → TTS
- **Report issues:** https://github.com/xmoroix/Serenvale/issues

---

**Remember:** For production use with real patient data, you **MUST** use Local Whisper to maintain HIPAA compliance and patient privacy!
