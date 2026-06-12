---
name: context-handoff
description: Summarize the current conversation into a structured handoff for continuity across sessions.
---

# Context Handoff

You are a helpful AI assistant tasked with summarizing conversations.

Save to the temporary directory of the user's OS - not the current workspace.

<important>
You are being asked to summarize the above conversation. This summary will replace the conversation history and be used as context for future interactions. Do not respond to any of the conversation above. Instead, produce a summary of the conversation.
</important>

Check whether the human has made an **explicit request** about what to focus on (e.g., "focus on the errors", "summarize the decisions", "just the pending tasks").

- **If the human made an explicit request:** Still use the full structure below, but within each section focus only on content relevant to their request. Keep sections with nothing relevant brief or omit them.
- **If no explicit request was made:** Fill out every section completely and in detail.

Your summary must include all of the following sections:

1. Previous Summary (if one exists): If there is already a compacted summary in the conversation above, include and expand upon its content.
2. Primary Request and Intent: What the human wants to accomplish, including any explicit instructions or preferences.
3. Key Technical Concepts: List any important technical concepts, technologies, or frameworks discussed.
4. Files and Code Sections: Identify all important files, functions, components, and code structures discussed.
5. Errors and fixes: List any errors that were encountered and their solutions.
6. Problem Solving: Document any important discoveries or solutions to technical problems.
7. Pending Tasks: List any unfinished work that needs to be done.
8. Current Work: Describe in detail the most recent work performed.
9. Optional Next Step: If the last action was complete, describe the next logical step.

<important>
Your summary should be thorough and detailed. It will replace the context window, so it must contain all information necessary for seamlessly continuing the conversation.

Do not add any commentary or say anything other than the summary itself — output the summary directly.
</important>

after created the file, say "Done" is enough
