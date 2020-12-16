import GitUrlParse from 'git-url-parse';

export default function getGhRawUrl(gitHubUrl: string, rawProvider: string) {
  const { full_name, ref, filepath } = GitUrlParse(gitHubUrl);
  const directory = filepath
    .split('/')
    .slice(0, -1)
    .join('/');
  const ghPrefix = `https://github.com/${full_name}/blob/${ref}/${directory &&
    directory + '/'}`;
  const rawPrefix = `${rawProvider}${full_name}/${ref}/${directory &&
    directory + '/'}`;
  const rawSummaryUrl = `${rawPrefix}${filepath}`
  return { ghPrefix, rawPrefix, full_name, rawSummaryUrl };
}
