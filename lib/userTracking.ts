// 사용자 행동 추적 시스템 - Discord Webhook 연동

// 고유 사용자 ID 생성 (세션 기반)
const generateUserId = (): string => {
  if (typeof window === 'undefined') return '';

  let userId = sessionStorage.getItem('xlarge_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('xlarge_user_id', userId);
  }
  return userId;
};

// 사용자 정보 수집
interface UserInfo {
  userId: string;
  userAgent: string;
  language: string;
  referrer: string;
  screenSize: string;
  timestamp: string;
  timezone: string;
}

const getUserInfo = (): UserInfo => {
  if (typeof window === 'undefined') {
    return {
      userId: '',
      userAgent: '',
      language: '',
      referrer: '',
      screenSize: '',
      timestamp: new Date().toISOString(),
      timezone: ''
    };
  }

  return {
    userId: generateUserId(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    referrer: document.referrer || 'direct',
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

// 클릭 이벤트 데이터
export interface ClickEvent {
  type: 'click';
  element: string;
  text: string;
  section: string;
  position: { x: number; y: number };
}

// 스크롤 이벤트 데이터
export interface ScrollEvent {
  type: 'scroll';
  depth: number;
  section: string;
  timeSpent: number; // 해당 섹션에서 보낸 시간 (ms)
}

// 페이지 뷰 이벤트
export interface PageViewEvent {
  type: 'pageview';
  path: string;
  title: string;
}

// 섹션 뷰 이벤트 (특정 섹션에 얼마나 머물렀는지)
export interface SectionViewEvent {
  type: 'section_view';
  section: string;
  viewDuration: number; // 초 단위
  scrollDepthInSection: number; // 섹션 내 스크롤 깊이 %
}

// 세션 종료 이벤트 (요약)
export interface SessionSummaryEvent {
  type: 'session_summary';
  totalDuration: number; // 초 단위
  sectionsViewed: { section: string; duration: number }[];
  clickCount: number;
  maxScrollDepth: number;
  interactedElements: string[];
}

type TrackingEvent = ClickEvent | ScrollEvent | PageViewEvent | SectionViewEvent | SessionSummaryEvent;

// Discord Webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1464463734020771860/O_naBeXiE5w7U5ySsGTwpf6vyGmdByPAz4PebsElKneSAiWBB9pi-teVP64Bqy9A-2Fl';

// 이벤트 버퍼 (배치 전송용)
let eventBuffer: { event: TrackingEvent; userInfo: UserInfo }[] = [];
let bufferTimer: ReturnType<typeof setTimeout> | null = null;

// Discord로 이벤트 전송
const sendToDiscord = async (events: { event: TrackingEvent; userInfo: UserInfo }[]) => {
  if (events.length === 0) return;

  try {
    const userInfo = events[0].userInfo;

    // 이벤트 타입별 그룹핑
    const eventsByType = events.reduce((acc, { event }) => {
      if (!acc[event.type]) acc[event.type] = [];
      acc[event.type].push(event);
      return acc;
    }, {} as Record<string, TrackingEvent[]>);

    // Discord Embed 생성
    const embeds = [];

    // 사용자 정보 Embed
    const userEmbed = {
      title: '👤 사용자 정보',
      color: 0x00F5A0,
      fields: [
        { name: '🆔 User ID', value: userInfo.userId, inline: true },
        { name: '📱 Device', value: userInfo.screenSize, inline: true },
        { name: '🌐 Language', value: userInfo.language, inline: true },
        { name: '📎 Referrer', value: userInfo.referrer.substring(0, 100) || 'Direct', inline: false },
        { name: '🕐 Time', value: new Date(userInfo.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }), inline: true },
      ],
      footer: { text: userInfo.userAgent.substring(0, 100) }
    };
    embeds.push(userEmbed);

    // 클릭 이벤트 Embed
    if (eventsByType.click && eventsByType.click.length > 0) {
      const clicks = eventsByType.click as ClickEvent[];
      const clickSummary = clicks.map(c =>
        `• **${c.section}**: ${c.text || c.element} (${c.position.x}, ${c.position.y})`
      ).join('\n');

      embeds.push({
        title: `🖱️ 클릭 이벤트 (${clicks.length}회)`,
        color: 0x00D9F5,
        description: clickSummary.substring(0, 2000)
      });
    }

    // 섹션 뷰 이벤트 Embed
    if (eventsByType.section_view && eventsByType.section_view.length > 0) {
      const sections = eventsByType.section_view as SectionViewEvent[];
      const sectionSummary = sections.map(s =>
        `• **${s.section}**: ${s.viewDuration}초 (스크롤 ${s.scrollDepthInSection}%)`
      ).join('\n');

      embeds.push({
        title: '👁️ 섹션별 체류 시간',
        color: 0xFFD700,
        description: sectionSummary.substring(0, 2000)
      });
    }

    // 세션 요약 Embed
    if (eventsByType.session_summary && eventsByType.session_summary.length > 0) {
      const summary = eventsByType.session_summary[0] as SessionSummaryEvent;
      const sectionDetails = summary.sectionsViewed
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .map(s => `• ${s.section}: ${s.duration}초`)
        .join('\n');

      embeds.push({
        title: '📊 세션 요약',
        color: 0xFF6B6B,
        fields: [
          { name: '⏱️ 총 체류 시간', value: `${summary.totalDuration}초`, inline: true },
          { name: '🖱️ 총 클릭 수', value: `${summary.clickCount}회`, inline: true },
          { name: '📜 최대 스크롤', value: `${summary.maxScrollDepth}%`, inline: true },
        ],
        description: sectionDetails ? `**섹션별 시간:**\n${sectionDetails}` : undefined
      });
    }

    // Discord로 전송
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds })
    });

  } catch (error) {
    console.error('[Tracking] Failed to send to Discord:', error);
  }
};

// 버퍼에 이벤트 추가 (배치 전송)
const addToBuffer = (event: TrackingEvent) => {
  const userInfo = getUserInfo();
  eventBuffer.push({ event, userInfo });

  // 10초마다 또는 10개 이상일 때 전송
  if (eventBuffer.length >= 10) {
    flushBuffer();
  } else if (!bufferTimer) {
    bufferTimer = setTimeout(flushBuffer, 10000);
  }
};

// 버퍼 비우고 전송
const flushBuffer = () => {
  if (bufferTimer) {
    clearTimeout(bufferTimer);
    bufferTimer = null;
  }

  if (eventBuffer.length > 0) {
    const eventsToSend = [...eventBuffer];
    eventBuffer = [];
    sendToDiscord(eventsToSend);
  }
};

// 공개 API
export const tracking = {
  // 클릭 추적
  trackClick: (element: string, text: string, section: string, position: { x: number; y: number }) => {
    addToBuffer({
      type: 'click',
      element,
      text,
      section,
      position
    });
  },

  // 스크롤 추적
  trackScroll: (depth: number, section: string, timeSpent: number) => {
    addToBuffer({
      type: 'scroll',
      depth,
      section,
      timeSpent
    });
  },

  // 페이지 뷰 추적
  trackPageView: (path: string, title: string) => {
    addToBuffer({
      type: 'pageview',
      path,
      title
    });
  },

  // 섹션 뷰 추적
  trackSectionView: (section: string, viewDuration: number, scrollDepthInSection: number) => {
    addToBuffer({
      type: 'section_view',
      section,
      viewDuration,
      scrollDepthInSection
    });
  },

  // 세션 요약 전송 (페이지 이탈 시)
  sendSessionSummary: (summary: Omit<SessionSummaryEvent, 'type'>) => {
    // 즉시 전송 (페이지 이탈 시이므로)
    const event: SessionSummaryEvent = { type: 'session_summary', ...summary };
    const userInfo = getUserInfo();

    // sendBeacon 사용 (페이지 이탈 시에도 전송 보장)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const payload = JSON.stringify({
        embeds: [{
          title: '📊 세션 종료 - 요약',
          color: 0xFF6B6B,
          fields: [
            { name: '🆔 User ID', value: userInfo.userId, inline: true },
            { name: '⏱️ 총 체류 시간', value: `${summary.totalDuration}초`, inline: true },
            { name: '🖱️ 총 클릭 수', value: `${summary.clickCount}회`, inline: true },
            { name: '📜 최대 스크롤', value: `${summary.maxScrollDepth}%`, inline: true },
          ],
          description: summary.sectionsViewed
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10)
            .map(s => `• ${s.section}: ${s.duration}초`)
            .join('\n'),
          footer: { text: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) }
        }]
      });
      navigator.sendBeacon(DISCORD_WEBHOOK_URL, new Blob([payload], { type: 'application/json' }));
    } else {
      sendToDiscord([{ event, userInfo }]);
    }
  },

  // 버퍼 강제 전송
  flush: flushBuffer,

  // 사용자 ID 가져오기
  getUserId: generateUserId
};
