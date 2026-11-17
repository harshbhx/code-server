export const usePlatformCapabilities = () => ({
    openExternalUrl: async () => undefined,
    writeClipboardHtml: async () => undefined,
    downloadFile: async () => true,
    readClipboard: async () => '',
});
