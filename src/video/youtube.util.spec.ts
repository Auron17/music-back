import { extractYoutubeId, youtubeThumbnail } from './youtube.util';

describe('extractYoutubeId', () => {
  it('extracts watch URL', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts watch URL with params', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe(
      'dQw4w9WgXcQ',
    );
  });

  it('extracts short URL', () => {
    expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts short URL with params', () => {
    expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ?t=5')).toBe('dQw4w9WgXcQ');
  });

  it('extracts embed URL', () => {
    expect(extractYoutubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('throws for invalid URL', () => {
    expect(() => extractYoutubeId('https://vimeo.com/123')).toThrow();
  });
});

describe('youtubeThumbnail', () => {
  it('builds thumbnail URL', () => {
    expect(youtubeThumbnail('abc123')).toBe('https://i.ytimg.com/vi/abc123/hqdefault.jpg');
  });
});
