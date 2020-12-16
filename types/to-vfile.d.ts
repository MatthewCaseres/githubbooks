declare module 'to-vfile' {
  import { VFile as OrigVFile, VFileContents, VFileOptions } from 'vfile';
  import { WriteFileOptions } from 'fs';
  namespace toVFile {
    type VFile_ = Pick<OrigVFile, keyof OrigVFile>;
    interface VFile extends VFile_ {} // to avoid expanding
    interface ToVFile {
      (input: VFileContents | VFile | VFileOptions): VFile;
      <F extends Pick<VFile, keyof VFile>>(input: F): F;
      read(
        input: VFileContents | VFile | VFileOptions,
        encoding?: string
      ): Promise<VFile>;
      read<F extends Pick<VFile, keyof VFile>>(
        input: F,
        encoding?: string
      ): Promise<F>;
      write(
        input: VFileContents | VFile | VFileOptions,
        fsOptions?: WriteFileOptions
      ): Promise<void>;
    }
  }
  const toVFile: toVFile.ToVFile;
  export = toVFile;
}
