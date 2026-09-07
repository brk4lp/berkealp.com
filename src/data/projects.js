// Public projects from https://github.com/brk4lp.
export const projects = [
  {
    id: 'tiny11-gui',
    title: 'Tiny11 GUI',
    description:
      'I built a Windows desktop app that makes it easier to create a lighter, customized Windows 11 ISO.',
    tags: ['C#', '.NET 8', 'WPF', 'PowerShell', 'DISM'],
    url: 'https://github.com/brk4lp/Tiny11-GUI',
    color: ['#512bd4', '#137bd1'],
  },
  {
    id: 'detay-folder-script',
    title: 'Photo Studio Folder Script',
    description:
      "I wrote this small Python script to create each day's photographer and side-photo folders automatically.",
    tags: ['Python', 'File Automation', 'Photo Studio'],
    url: 'https://github.com/brk4lp/detayFolderScript',
    color: ['#3776ab', '#ffd343'],
  },
  {
    id: 'gorleak',
    title: 'Gorleak',
    description:
      'I built a daily monitoring tool after finding an exposed media directory connected to a suspicious online marketplace.',
    tags: ['SQLite', 'Automation', 'Web Monitoring', 'OSINT'],
    status: 'Private case study',
    color: ['#20242c', '#c44536'],
    details: `# Gorleak

I came across a Telegram bot selling suspicious digital products. The bot redirected each user to a separate storefront linked to their Telegram ID, while visiting the main website directly returned a 403 response.

During my research, I found that one of the site's media directories was publicly accessible. It contained randomly named images related to the listed products. Most of the information was already activated or unusable, but the exposed directory itself was still a serious security problem.

## What I built

I built Gorleak to monitor that directory automatically. The tool runs once a day, checks the available filenames and compares them with the records already stored in SQLite.

When it discovers a filename that is not in the database, it:

- creates a folder named after the scan date
- saves the newly discovered image in that folder
- records the filename and discovery date in SQLite
- skips files that were already seen in earlier scans

This gave me a simple timeline of when new files appeared without processing the same items again.

## What I learned

- building repeatable and idempotent scheduled jobs
- using SQLite for lightweight historical tracking
- comparing new scan results with existing records
- organizing collected files by discovery date
- handling exposed data carefully and documenting security findings responsibly

I kept this as a private case study and did not publish or redistribute the exposed data.`,
  },
]
