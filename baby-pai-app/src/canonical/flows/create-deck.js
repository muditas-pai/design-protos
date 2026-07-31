/* The canonical create-a-deck flow.

   Steps are ids paired with a screen name. The screen resolves through
   useComponent like anything else, so a flow never owns a screen — it only
   says what order they come in. */
export default [
  { id: 'prompt', screen: 'Dashboard', label: 'Prompt' },
  { id: 'outline', screen: 'Outline', label: 'Outline' },
  { id: 'generating', screen: 'Generating', label: 'Generating' },
]
