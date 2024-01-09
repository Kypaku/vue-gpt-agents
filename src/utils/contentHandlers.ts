
export function handleContentBeforeWrite(path: string, content: string): string {
    if (path.endsWith(".js")) {
        return content.replace(/^\s?(\`\`\`)?\s?javascript?/, '')
    }
    return content
}
