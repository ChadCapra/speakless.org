export function formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

export function calculateDuration(startSeconds: number, endSeconds: number): number {
    return startSeconds - endSeconds;
}
