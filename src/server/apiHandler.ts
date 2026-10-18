import { GoogleGenAI } from '@google/genai';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface ChatMessagePayload {
  role: 'user' | 'model';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessagePayload[];
  systemInstruction?: string;
  sessionTitle?: string;
}

export interface ActionPromptRequest {
  actionType: string;
  template: string;
  systemInstruction?: string;
  variables: Record<string, string>;
  temperature?: number;
}

/**
 * Natasha v5.6 & Gemini 3.8 Flash Chat Handler
 * Enforces memory & token optimization: active context is strictly limited to last 5 messages,
 * summarizing or clearing prior turns to prevent hitting limits.
 */
export async function handleGeminiChat(reqData: ChatRequest) {
  const { messages, systemInstruction } = reqData;
  if (!messages || messages.length === 0) {
    throw new Error('No messages provided');
  }

  const ai = getAiClient();

  // Token & Memory Control Logic:
  // Only the last 5 messages are kept as active conversation context.
  const MAX_ACTIVE_TURNS = 5;
  const totalTurns = messages.length;
  const activeTurns = messages.slice(-MAX_ACTIVE_TURNS);
  const olderTurns = messages.slice(0, Math.max(0, totalTurns - MAX_ACTIVE_TURNS));

  let contextPrefix = '';
  if (olderTurns.length > 0) {
    // Generate an ultracompact rolling summary of older conversation
    const briefRecap = olderTurns
      .map((m) => `${m.role === 'user' ? 'Boss' : 'Natasha'}: ${m.content.slice(0, 90)}...`)
      .join(' | ');
    contextPrefix = `[Prior Conversation Memory: ${briefRecap}]\n\n`;
  }

  const defaultNatashaPrompt = `You are Natasha v5.6, the executive AI operative for Raj Expo Digitals.
You report directly to the Boss. You specialize in executive digital operations, inventory insights,
catalog copy, client correspondence, data integrity, and server automation.
Speak with sharp professional precision, tactical confidence, and crisp formatting. Avoid fluff.`;

  const contents = activeTurns.map((msg, index) => {
    let text = msg.content;
    // Prepend older context to the first active turn if applicable
    if (index === 0 && contextPrefix) {
      text = `${contextPrefix}Current query: ${text}`;
    }
    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text }],
    };
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: contents as any,
    config: {
      systemInstruction: systemInstruction || defaultNatashaPrompt,
      temperature: 0.7,
      topP: 0.95,
    },
  });

  const responseText = response.text || 'Operational dispatch received. No textual output produced.';

  // Calculate honest token metrics
  const estimatedInputChars = messages.reduce((acc, m) => acc + m.content.length, 0);
  const optimizedInputChars = activeTurns.reduce((acc, m) => acc + m.content.length, 0) + contextPrefix.length;
  const tokensUsed = Math.ceil((optimizedInputChars + responseText.length) / 4);
  const tokensSaved = Math.max(0, Math.ceil((estimatedInputChars - optimizedInputChars) / 4));

  return {
    text: responseText,
    tokensUsed,
    tokensSaved,
    activeContextCount: activeTurns.length,
    olderSummarizedCount: olderTurns.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Action-Specific Prompt Runner
 * For Ask AI, Write with AI, Labels, Descriptions, Gmail, WhatsApp, SQL, Cloudinary
 */
export async function handleActionPrompt(reqData: ActionPromptRequest) {
  const { actionType, template, systemInstruction, variables, temperature = 0.7 } = reqData;

  // Interpolate {{variable}} tokens into prompt
  let renderedPrompt = template;
  for (const [key, val] of Object.entries(variables || {})) {
    const reg = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    renderedPrompt = renderedPrompt.replace(reg, val || '');
  }

  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: renderedPrompt,
    config: {
      systemInstruction:
        systemInstruction ||
        `You are an action execution sub-agent within Raj Expo Digitals Server. Execute the requested prompt format cleanly with high professional quality.`,
      temperature: Math.min(Math.max(temperature, 0), 1.5),
    },
  });

  const resultText = response.text || '';
  const tokensUsed = Math.ceil((renderedPrompt.length + resultText.length) / 4);

  return {
    actionType,
    renderedPrompt,
    result: resultText,
    tokensUsed,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Honest GitHub Sync Handler
 * Supports testing credentials or committing snapshot files to user repository via GitHub API
 */
export async function handleGitHubSync(payload: {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  filePath?: string;
  content?: string;
  commitMessage?: string;
}) {
  const { owner, repo, branch, token, filePath = 'raj-expo-database-backup.json', content, commitMessage } = payload;

  if (!owner || !repo || !token) {
    return {
      success: false,
      error: 'Missing required GitHub parameters: repository owner, repo name, and personal access token are required.',
    };
  }

  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const cleanBranch = (branch || 'main').trim();
  const cleanToken = token.trim();

  try {
    // 1. Verify Repository Access
    const repoRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, {
      headers: {
        Authorization: `token ${cleanToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'RajExpoDigitalsServer',
      },
    });

    if (!repoRes.ok) {
      const errJson: any = await repoRes.json().catch(() => ({}));
      return {
        success: false,
        error: `GitHub API error (${repoRes.status}): ${errJson.message || repoRes.statusText}`,
      };
    }

    const repoInfo = await repoRes.json();

    // 2. If content is provided, commit the file directly
    if (content) {
      const fileUrl = `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${filePath}?ref=${cleanBranch}`;
      
      // Check existing file SHA if updating
      let existingSha: string | undefined;
      const getFileRes = await fetch(fileUrl, {
        headers: {
          Authorization: `token ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'RajExpoDigitalsServer',
        },
      });

      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        existingSha = fileData.sha;
      }

      // Base64 encode file content
      const contentBase64 = Buffer.from(content).toString('base64');
      const putBody: any = {
        message: commitMessage || `Database Backup & Schema Sync [Raj Expo Digitals Server]`,
        content: contentBase64,
        branch: cleanBranch,
      };
      if (existingSha) {
        putBody.sha = existingSha;
      }

      const putRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${cleanToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'RajExpoDigitalsServer',
        },
        body: JSON.stringify(putBody),
      });

      if (!putRes.ok) {
        const putErr: any = await putRes.json().catch(() => ({}));
        return {
          success: false,
          error: `Failed to commit backup: ${putErr.message || putRes.statusText}`,
        };
      }

      const commitResult = await putRes.json();
      return {
        success: true,
        action: 'committed',
        commitSha: commitResult.commit?.sha || 'committed',
        fileUrl: commitResult.content?.html_url || `https://github.com/${cleanOwner}/${cleanRepo}/blob/${cleanBranch}/${filePath}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Only test access
    return {
      success: true,
      action: 'verified',
      repoName: repoInfo.full_name,
      defaultBranch: repoInfo.default_branch,
      visibility: repoInfo.private ? 'Private' : 'Public',
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Network error connecting to GitHub: ${err.message || 'Check internet connection and token permissions'}`,
    };
  }
}
