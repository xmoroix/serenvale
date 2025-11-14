# Local Whisper Integration Plan

## Overview

This document outlines the plan to integrate local Whisper STT (Speech-to-Text) for **privacy-compliant** radiology reporting. Patient data cannot be sent to OpenAI, so we need local transcription.

**Status:** Planned for future implementation (after demo polish)

---

## Why Local Whisper?

### Requirements:
1. **Privacy:** Patient dictations contain PHI (Protected Health Information) - cannot send to cloud
2. **Speed:** Local transcription is faster than cloud API calls
3. **Offline:** Works without internet connection
4. **Cost:** No per-minute API charges

### Current Limitations:
- OpenAI Whisper (`whisper-1` model) sends audio to cloud
- Browser STT has poor accuracy for medical terminology

---

## Integration Approach: Follow LLM Provider Pattern

Instead of bundling Whisper, we'll treat it like an **LLM provider**:

1. **User runs local Whisper server** (separate process)
2. **Configure API endpoint in settings** (just like Ollama, vLLM)
3. **Serenvale connects via HTTP API**

This approach:
- ✅ Keeps Serenvale lightweight (no Whisper bundled)
- ✅ Allows users to choose their Whisper deployment
- ✅ Follows existing patterns (familiar to users)
- ✅ Supports different Whisper implementations

---

## Recommended Local Whisper Servers

### Option 1: faster-whisper (Recommended)
**Best for:** Production deployments, best speed/accuracy balance

```bash
# Install
pip install faster-whisper

# Run server
python -m faster_whisper.server \
  --model large-v3 \
  --device cuda \
  --compute_type float16 \
  --port 9000
```

**Features:**
- 4x faster than OpenAI's implementation
- CTranslate2 optimization
- GPU support (CUDA, Metal)
- API compatible with OpenAI Whisper

**GitHub:** https://github.com/SYSTRAN/faster-whisper

---

### Option 2: whisper.cpp
**Best for:** CPU-only deployments, edge devices

```bash
# Install
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
make

# Download model
./models/download-ggml-model.sh large-v3

# Run server
./server -m models/ggml-large-v3.bin -p 9000
```

**Features:**
- Runs on CPU efficiently
- C++ implementation (fast)
- Low memory usage
- Good for ARM devices (Raspberry Pi, etc.)

**GitHub:** https://github.com/ggerganov/whisper.cpp

---

### Option 3: OpenedAI Speech
**Best for:** Drop-in replacement for OpenAI API

```bash
# Install
pip install openedai-speech

# Run server
python -m openedai_speech --port 9000
```

**Features:**
- 100% OpenAI API compatible
- Includes TTS + STT
- Easy migration from OpenAI

**GitHub:** https://github.com/matatonic/openedai-speech

---

## Implementation Steps

### 1. Add Whisper Provider to Settings

**File:** `src/app/[variants]/(main)/settings/tts/features/const.tsx`

```typescript
export const sttOptions: SelectProps['options'] = [
  {
    label: 'OpenAI Whisper',
    value: 'openai',
  },
  {
    label: 'Browser',
    value: 'browser',
  },
  {
    label: 'Local Whisper', // NEW
    value: 'local-whisper',
  },
];
```

---

### 2. Add Local Whisper Configuration Form

**File:** `src/app/[variants]/(main)/settings/tts/features/STT.tsx`

Add form fields when `sttServer === 'local-whisper'`:

```typescript
{sttServer === 'local-whisper' && (
  <>
    <Form.Item
      label="Whisper API URL"
      name={['localWhisper', 'apiUrl']}
      rules={[{ required: true }]}
    >
      <Input placeholder="http://localhost:9000/v1/audio/transcriptions" />
    </Form.Item>

    <Form.Item
      label="Model"
      name={['localWhisper', 'model']}
    >
      <Select>
        <Select.Option value="large-v3">large-v3 (Best accuracy)</Select.Option>
        <Select.Option value="medium">medium (Balanced)</Select.Option>
        <Select.Option value="small">small (Fastest)</Select.Option>
      </Select>
    </Form.Item>

    <Form.Item
      label="Language"
      name={['localWhisper', 'language']}
    >
      <Select>
        <Select.Option value="auto">Auto-detect</Select.Option>
        <Select.Option value="en">English</Select.Option>
        <Select.Option value="fr">French</Select.Option>
        <Select.Option value="es">Spanish</Select.Option>
      </Select>
    </Form.Item>
  </>
)}
```

---

### 3. Create Local Whisper STT Hook

**File:** `src/features/ChatInput/ActionBar/STT/localWhisper.tsx`

```typescript
'use client';

import { ChatMessageError } from '@lobechat/types';
import { getRecordMineType } from '@lobehub/tts';
import { OpenAISTTOptions, useOpenAISTT } from '@lobehub/tts/react';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SWRConfiguration } from 'swr';

import { API_ENDPOINTS } from '@/services/_url';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/slices/message/selectors';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { getMessageError } from '@/utils/fetch';

import CommonSTT from './common';

interface STTConfig extends SWRConfiguration {
  onTextChange: (value: string) => void;
}

const useLocalWhisperSTT = (config: STTConfig) => {
  const ttsSettings = useUserStore(settingsSelectors.currentTTS, isEqual);
  const ttsAgentSettings = useAgentStore(agentSelectors.currentAgentTTS, isEqual);
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

  const autoStop = ttsSettings.sttAutoStop;
  const sttLocale =
    ttsAgentSettings?.sttLocale && ttsAgentSettings.sttLocale !== 'auto'
      ? ttsAgentSettings.sttLocale
      : locale;

  // Get local Whisper config from settings
  const localWhisperUrl = ttsSettings.localWhisper?.apiUrl || 'http://localhost:9000/v1/audio/transcriptions';
  const localWhisperModel = ttsSettings.localWhisper?.model || 'large-v3';

  return useOpenAISTT(sttLocale, {
    ...config,
    api: {
      serviceUrl: localWhisperUrl,
    },
    autoStop,
    options: {
      mineType: getRecordMineType(),
      model: localWhisperModel,
    },
  } as OpenAISTTOptions);
};

const LocalWhisperSTT = memo<{ mobile?: boolean }>(({ mobile }) => {
  const [error, setError] = useState<ChatMessageError>();
  const { t } = useTranslation('chat');

  const [loading, updateInputMessage] = useChatStore((s) => [
    chatSelectors.isAIGenerating(s),
    s.updateInputMessage,
  ]);

  const setDefaultError = useCallback(
    (err?: any) => {
      setError({
        body: err,
        message: t('stt.localWhisperError', {
          ns: 'error',
          defaultValue: 'Local Whisper connection error. Make sure Whisper server is running.'
        }),
        type: 500
      });
    },
    [t],
  );

  const { start, isLoading, stop, formattedTime, time, response, isRecording } = useLocalWhisperSTT({
    onError: (err) => {
      stop();
      setDefaultError(err);
    },
    onErrorRetry: (err) => {
      stop();
      setDefaultError(err);
    },
    onSuccess: async () => {
      if (!response) return;
      if (response.status === 200) return;
      const message = await getMessageError(response);
      if (message) {
        setError(message);
      } else {
        setDefaultError();
      }
      stop();
    },
    onTextChange: (text) => {
      if (loading) stop();
      if (text) updateInputMessage(text);
    },
  });

  const desc = t('stt.action');

  const handleTriggerStartStop = useCallback(() => {
    if (loading) return;
    if (!isLoading) {
      start();
    } else {
      stop();
    }
  }, [loading, isLoading, start, stop]);

  const handleCloseError = useCallback(() => {
    setError(undefined);
    stop();
  }, [stop]);

  const handleRetry = useCallback(() => {
    setError(undefined);
    start();
  }, [start]);

  return (
    <CommonSTT
      desc={desc}
      error={error}
      formattedTime={formattedTime}
      handleCloseError={handleCloseError}
      handleRetry={handleRetry}
      handleTriggerStartStop={handleTriggerStartStop}
      isLoading={isLoading}
      isRecording={isRecording}
      mobile={mobile}
      time={time}
    />
  );
});

export default LocalWhisperSTT;
```

---

### 4. Update STT Selector

**File:** `src/features/ChatInput/ActionBar/STT/index.tsx`

```typescript
import BrowserSTT from './browser';
import OpenaiSTT from './openai';
import LocalWhisperSTT from './localWhisper'; // NEW

const STT = ({ mobile }: { mobile?: boolean }) => {
  const sttServer = useUserStore((s) => s.settings.tts.sttServer);

  switch (sttServer) {
    case 'browser':
      return <BrowserSTT mobile={mobile} />;
    case 'openai':
      return <OpenaiSTT mobile={mobile} />;
    case 'local-whisper': // NEW
      return <LocalWhisperSTT mobile={mobile} />;
    default:
      return <BrowserSTT mobile={mobile} />;
  }
};
```

---

### 5. Update User Settings Type

**File:** `packages/types/src/user/settings/tts.ts`

```typescript
export interface LocalWhisperConfig {
  apiUrl: string;
  model?: 'tiny' | 'base' | 'small' | 'medium' | 'large' | 'large-v2' | 'large-v3';
  language?: string;
}

export interface TTSSettings {
  // ... existing fields
  sttServer: 'browser' | 'openai' | 'local-whisper';
  localWhisper?: LocalWhisperConfig; // NEW
}
```

---

## Docker Compose Setup (Production)

For production deployment, run Whisper alongside Serenvale:

```yaml
version: '3.8'

services:
  serenvale:
    image: serenvale:latest
    ports:
      - "3010:3010"
    environment:
      - NEXT_PUBLIC_LOCAL_WHISPER_URL=http://whisper:9000
    depends_on:
      - whisper
      - postgres

  whisper:
    image: onerahmet/openai-whisper-asr-webservice:latest-gpu
    ports:
      - "9000:9000"
    environment:
      - ASR_MODEL=large-v3
      - ASR_ENGINE=faster_whisper
    volumes:
      - whisper-models:/root/.cache/whisper
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  postgres:
    image: postgres:16
    # ... postgres config

volumes:
  whisper-models:
```

---

## Testing Plan

### 1. Local Development Testing
```bash
# Terminal 1: Start Whisper server
python -m faster_whisper.server --model large-v3 --port 9000

# Terminal 2: Start Serenvale
bun run dev

# Terminal 3: Test STT endpoint
curl -X POST http://localhost:9000/v1/audio/transcriptions \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-audio.mp3" \
  -F "model=large-v3"
```

### 2. Medical Terminology Test
Create test audio files with:
- Medical terms (pneumothorax, hemothorax, etc.)
- Anatomical terms (anterior, posterior, etc.)
- French medical terms (if applicable)

### 3. Performance Benchmarks
- Transcription latency (target: <2 seconds for 30-second audio)
- Accuracy on medical terminology
- GPU memory usage

---

## Security Considerations

### 1. Network Security
- **Local-only:** Default to `localhost:9000` (no external access)
- **HTTPS:** Support TLS for remote Whisper servers
- **Auth:** Support API key auth if Whisper server requires it

### 2. Data Privacy
- **No cloud:** Audio never leaves local network
- **Ephemeral:** Audio deleted immediately after transcription
- **Audit logs:** Log STT usage for HIPAA compliance

### 3. Rate Limiting
- Prevent abuse of local Whisper server
- Queue management for multiple concurrent transcriptions

---

## Future Enhancements

### 1. Model Management UI
- Download Whisper models directly from settings
- Switch models based on speed/accuracy needs
- Show model size and GPU requirements

### 2. Custom Medical Dictionary
- Fine-tune Whisper on medical terminology
- Add custom vocabulary (clinic-specific terms)
- Support for multiple languages

### 3. Real-time Streaming
- Stream audio as it's being recorded
- Show partial transcriptions in real-time
- Faster perceived latency

---

## Implementation Priority

**Phase 1 (Demo):**
- ✅ Use OpenAI Whisper for demo
- ✅ Focus on PACS + OpenAI chat integration
- ✅ Document local Whisper plan

**Phase 2 (Production Prep):**
- ⏳ Implement local Whisper STT option
- ⏳ Test with faster-whisper server
- ⏳ Create Docker Compose setup

**Phase 3 (Production):**
- ⏳ Medical terminology optimization
- ⏳ Multi-language support
- ⏳ Real-time streaming

---

## Automation Script (Future)

Create a helper script to set up local Whisper:

**File:** `scripts/setup-local-whisper.sh`

```bash
#!/bin/bash

echo "🎙️ Setting up Local Whisper for Serenvale"

# Check GPU
if command -v nvidia-smi &> /dev/null; then
    echo "✅ NVIDIA GPU detected"
    DEVICE="cuda"
else
    echo "⚠️  No GPU detected, using CPU (slower)"
    DEVICE="cpu"
fi

# Install faster-whisper
echo "📦 Installing faster-whisper..."
pip install faster-whisper

# Download model
echo "📥 Downloading Whisper large-v3 model..."
python -c "from faster_whisper import WhisperModel; WhisperModel('large-v3', device='${DEVICE}')"

# Create systemd service (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔧 Creating systemd service..."
    cat > /etc/systemd/system/whisper-stt.service <<EOF
[Unit]
Description=Local Whisper STT Server
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/bin/python3 -m faster_whisper.server --model large-v3 --device ${DEVICE} --port 9000
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable whisper-stt
    systemctl start whisper-stt

    echo "✅ Whisper service installed and started"
    echo "📍 API endpoint: http://localhost:9000/v1/audio/transcriptions"
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Go to Serenvale Settings → TTS"
echo "2. Select 'Local Whisper' as STT Service"
echo "3. Configure API URL: http://localhost:9000/v1/audio/transcriptions"
echo "4. Test with microphone button in chat"
```

---

## Resources

- **Whisper Paper:** https://arxiv.org/abs/2212.04356
- **faster-whisper:** https://github.com/SYSTRAN/faster-whisper
- **whisper.cpp:** https://github.com/ggerganov/whisper.cpp
- **OpenAI Whisper API:** https://platform.openai.com/docs/api-reference/audio
- **HIPAA Compliance:** https://www.hhs.gov/hipaa/for-professionals/security/index.html

---

**Status:** Documentation complete, ready for implementation after demo polish.

**Contact:** For questions about this plan, see `BRANDING.md` or open an issue.
