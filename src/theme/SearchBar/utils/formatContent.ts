export const formatContent = (content: string): string => {
  return (
    content
      // Remove triple backtick code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove single backticks but keep the content
      .replace(/`([^`]+)`/g, '$1')
      // Remove bold/italic markers but keep the content
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Replace markdown links with just the text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove HTML tags
      .replace(/<[^>]*>?/gm, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
};
