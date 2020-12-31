import GitUrlParse from 'git-url-parse';

export default function getGhRawUrl(gitHubUrl: string, rawProvider: string) {
  const { full_name, pathname } = GitUrlParse(gitHubUrl);
  const dir = pathname
    .split('/')
    .slice(0, -1)
    .join('/');
  const ghPrefix = `https://github.com${dir + '/'}`;

  const rawPrefix = `${rawProvider}${dir.replace('blob/', '') + '/'}`;
  const rawSummaryUrl = `${rawProvider}${pathname.replace('blob/', '')}`;
  return { ghPrefix, rawPrefix, full_name, rawSummaryUrl };
}
