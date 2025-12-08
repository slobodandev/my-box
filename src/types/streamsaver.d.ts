declare module 'streamsaver' {
  interface StreamSaver {
    createWriteStream(filename: string, options?: {
      size?: number;
      pathname?: string;
      writableStrategy?: QueuingStrategy;
      readableStrategy?: QueuingStrategy;
    }): WritableStream<Uint8Array>;
    mitm?: string;
  }

  const streamSaver: StreamSaver;
  export default streamSaver;
}
