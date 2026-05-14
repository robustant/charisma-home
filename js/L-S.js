// =========================
// 配置区
// =========================
const API_URL = 'https://voicecup.com/api';
const API_KEY = 'Y5WUMRKYd8';
const API_LANG = 'eng';

const AUTO_PLAY = true;
const YOUTUBE_AUTOPLAY_MUTED = false;

// =========================
// 全局状态
// =========================
let currentHits = [];
let xhrSearchText = null;
let youtubePlayer = null;
let youtubeApiReady = false;
let youtubePendingHit = null;
let youtubeStopTimer = null;

// =========================
// DOM 快捷方法
// =========================
const $ = id => document.getElementById(id);

// =========================
// 初始化
// =========================
document.addEventListener('DOMContentLoaded', () => {
  loadYouTubeApi();

  $('searchBtn').addEventListener('click', handleSearch);
  $('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch();
  });
});

// =========================
// 加载 YouTube Iframe API
// =========================
function loadYouTubeApi() {
  if (window.YT?.Player) {
    youtubeApiReady = true;
    return;
  }

  if (!$('youtube-iframe-api')) {
    const script = document.createElement('script');
    script.id = 'youtube-iframe-api';
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  }

  window.onYouTubeIframeAPIReady = () => {
    youtubeApiReady = true;
    if (youtubePendingHit) {
      renderYoutubePlayer(youtubePendingHit);
      youtubePendingHit = null;
    }
  };
}

// =========================
// 搜索入口
// =========================
function handleSearch() {
  const keyword = $('searchInput').value.trim();

  if (!keyword) return renderError('请输入 a word or phrase');

  stopAllPlayback();
  renderLoading();
  searchVoicecup(keyword);
}

// =========================
// Voicecup 搜索
// =========================
function searchVoicecup(keyword) {
  if (!window.jQuery) {
    return renderError('缺少 jQuery。Voicecup 官方 JSONP 调用依赖 jQuery。');
  }

  xhrSearchText?.abort();

  xhrSearchText = window.jQuery.ajax({
    type: 'POST',
    url: API_URL,
    dataType: 'jsonp',
    jsonp: 'callback',
    crossDomain: true,
    cache: false,
    data: {
      lang: API_LANG,
      q: keyword,
      key: API_KEY,
      from: 0,
      size: 20,
      duration_min: 0,
      duration_max: 15,
      include_external_sources: 1,
      format: 'jsonp'
    },
    beforeSend(xhr) {
      xhr?.overrideMimeType?.('text/plain; charset=utf-8');
    },
    success(json) {
      handleSearchSuccess(json);
      updateSearchInfo(json);
    },
    error(_jqXHR, textStatus) {
      if (textStatus !== 'abort') {
        renderError('Error executing search script: ' + textStatus);
      }
    }
  });
}

// =========================
// 搜索成功处理
// =========================
function handleSearchSuccess(json) {
  if (!json) return renderError('接口返回为空');

  if (json.res === 'error') {
    return renderError(Array.isArray(json.errors) ? json.errors.join('；') : '接口返回错误');
  }

  const hits = Array.isArray(json.hits) ? json.hits : [];
  currentHits = hits;

  if (!hits.length || json.hits_total === 0) {
    $('clipList').innerHTML = '<div class="clip-empty">Nothing was found</div>';
    $('activeVideoPlayer').innerHTML = '<div class="empty-player">暂无视频结果</div>';
    $('activeAudioPlayer').innerHTML = '';
    $('activeClipMeta').textContent = '暂无片段信息';
    return;
  }

  renderClipList(hits);
  setActiveClip(0);
}

// =========================
// 状态渲染
// =========================
function renderLoading() {
  $('clipList').innerHTML = '<div class="loading-box">正在搜索 clips...</div>';
  $('activeVideoPlayer').innerHTML = '<div class="empty-player">正在加载视频...</div>';
  $('activeAudioPlayer').innerHTML = '';
  $('activeClipMeta').textContent = '请稍候...';
}

function renderError(message) {
  $('clipList').innerHTML = `<div class="error-box">${escapeHtml(message)}</div>`;
  $('activeVideoPlayer').innerHTML = '<div class="empty-player">请先完成搜索</div>';
  $('activeAudioPlayer').innerHTML = '';
  $('activeClipMeta').textContent = '当前片段信息将显示在这里';
}

// =========================
// 渲染右侧 clips
// =========================
function renderClipList(hits) {
  const clipList = $('clipList');
  clipList.innerHTML = hits.map((hit, index) => `
    <div class="clip-item" data-index="${index}">
      <div class="clip-icon">▶</div>
      <div class="clip-text">${getDisplayText(hit)}</div>
      <div class="clip-duration">${formatDuration(hit.duration_precise || hit.duration || 0)}</div>
    </div>
  `).join('');

  clipList.querySelectorAll('.clip-item').forEach(item => {
    item.addEventListener('click', () => setActiveClip(Number(item.dataset.index)));
  });
}

// =========================
// 切换 clip
// =========================
function setActiveClip(index) {
  const hit = currentHits[index];
  if (!hit) return;

  stopAllPlayback();

  document.querySelectorAll('.clip-item').forEach(item => item.classList.remove('active'));

  const activeItem = document.querySelector(`.clip-item[data-index="${index}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  renderActiveVideo(hit);
  renderActiveAudio(hit);
  renderActiveMeta(hit);
}

// =========================
// 停止所有播放
// =========================
function stopAllPlayback() {
  if (youtubeStopTimer) {
    clearTimeout(youtubeStopTimer);
    youtubeStopTimer = null;
  }

  document.querySelectorAll('#activeVideoPlayer video, #activeAudioPlayer audio').forEach(el => {
    try { el.pause(); } catch (e) {}
  });

  if (youtubePlayer?.stopVideo) {
    try { youtubePlayer.stopVideo(); } catch (e) {}
  }
}

// =========================
// URL 工具
// =========================
function getSegmentParams(hit) {
  return {
    start: hit.start_precise ?? hit.start ?? 0,
    duration: hit.duration_precise ?? hit.duration ?? 0,
    subsId: hit.id || ''
  };
}

function buildVoicecupPlayUrl(hit, { video = 0, filetype }) {
  const { start, duration, subsId } = getSegmentParams(hit);
  return `https://voicecup.com/play?key=${encodeURIComponent(API_KEY)}&video=${video}&filename=${encodeURIComponent(hit.filename_audio)}&filetype=${filetype}&start=${encodeURIComponent(start)}&duration=${encodeURIComponent(duration)}&subs_id=${encodeURIComponent(subsId)}&app_name=voicecup.com`;
}

function hasYoutube(hit) {
  return !!hit.youtube_info?.video_id;
}

function hasVoicecupMedia(hit) {
  return Number(hit.file_ready) === 1 && !!hit.filename_audio;
}

function hasAnyVideo(hit) {
  return hasYoutube(hit) || hasVoicecupMedia(hit) || !!hit.video_url;
}

// =========================
// 渲染主视频
// =========================
function renderActiveVideo(hit) {
  const container = $('activeVideoPlayer');

  if (hasYoutube(hit)) {
    container.innerHTML = '<div id="youtube-player-host" style="width:100%;height:100%;"></div>';
    if (!youtubeApiReady) {
      youtubePendingHit = hit;
      return;
    }
    return renderYoutubePlayer(hit);
  }

  if (hasVoicecupMedia(hit)) {
    const { duration } = getSegmentParams(hit);

    container.innerHTML = `
      <video id="mainVideoEl" controls preload="metadata" controlsList="nodownload" playsinline ${AUTO_PLAY ? 'muted' : ''}>
        <source src="${buildVoicecupPlayUrl(hit, { video: 1, filetype: 'mp4' })}" type="video/mp4">
        <source src="${buildVoicecupPlayUrl(hit, { video: 1, filetype: 'webm' })}" type="video/webm">
        您的浏览器不支持 video 标签
      </video>
    `;

    const videoEl = $('mainVideoEl');
    bindMediaSegmentStop(videoEl, Number(duration));
    safeAutoplay(videoEl);
    return;
  }

  if (hit.video_url) {
    container.innerHTML = `
      <video id="mainVideoEl" controls preload="metadata" playsinline ${AUTO_PLAY ? 'muted' : ''}>
        <source src="${escapeAttr(hit.video_url)}" type="video/mp4">
        您的浏览器不支持 video 标签
      </video>
    `;
    safeAutoplay($('mainVideoEl'));
    return;
  }

  container.innerHTML = '<div class="empty-player">该 clip 暂无视频资源</div>';
}

// =========================
// 渲染 YouTube
// =========================
function renderYoutubePlayer(hit) {
  const hostId = 'youtube-player-host';
  if (!$(hostId) || !window.YT?.Player) return;

  const startInt = parseInt(hit.start || 0, 10);
  const endInt = parseInt(hit.end || 0, 10);

  youtubePlayer = new YT.Player(hostId, {
    videoId: hit.youtube_info.video_id,
    playerVars: {
      start: startInt,
      end: endInt,
      rel: 0,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin,
      autoplay: AUTO_PLAY ? 1 : 0,
      mute: AUTO_PLAY && YOUTUBE_AUTOPLAY_MUTED ? 1 : 0
    },
    events: {
      onReady(event) {
        if (!AUTO_PLAY) return;
        try {
          if (YOUTUBE_AUTOPLAY_MUTED && event.target.mute) event.target.mute();
          event.target.playVideo();
        } catch (e) {}
      },
      onStateChange(event) {
        if (event.data === YT.PlayerState.ENDED) {
          try {
            event.target.seekTo(startInt);
            event.target.pauseVideo();
          } catch (e) {}
        }
      }
    }
  });
}

// =========================
// 渲染音频
// =========================
function renderActiveAudio(hit) {
  const container = $('activeAudioPlayer');

  if (hasVoicecupMedia(hit)) {
    const { duration } = getSegmentParams(hit);

    container.innerHTML = `
      <audio id="mainAudioEl" controls preload="metadata" controlsList="nodownload">
        <source src="${buildVoicecupPlayUrl(hit, { filetype: 'mp4' })}" type="audio/mp4">
        <source src="${buildVoicecupPlayUrl(hit, { filetype: 'webm' })}" type="audio/webm">
        您的浏览器不支持 audio 标签
      </audio>
    `;

    if (!hasAnyVideo(hit)) {
      const audioEl = $('mainAudioEl');
      bindMediaSegmentStop(audioEl, Number(duration));
      safeAutoplay(audioEl);
    }
    return;
  }

  if (hit.audio_url) {
    container.innerHTML = `
      <audio id="mainAudioEl" controls preload="metadata">
        <source src="${escapeAttr(hit.audio_url)}" type="audio/mpeg">
        您的浏览器不支持 audio 标签
      </audio>
    `;
    return;
  }

  container.innerHTML = '';
}

// =========================
// 绑定片段时长结束
// =========================
function bindMediaSegmentStop(mediaEl, duration) {
  if (!mediaEl || duration <= 0) return;

  mediaEl.addEventListener('play', () => {
    clearTimeout(youtubeStopTimer);
    youtubeStopTimer = setTimeout(() => {
      try {
        mediaEl.pause();
        mediaEl.currentTime = 0;
      } catch (e) {}
    }, Math.ceil(duration * 1000));
  });
}

// =========================
// 安全自动播放
// =========================
function safeAutoplay(mediaEl) {
  if (!AUTO_PLAY || !mediaEl) return;

  const attemptPlay = () => {
    try {
      mediaEl.play()?.catch?.(() => {});
    } catch (e) {}
  };

  mediaEl.addEventListener('loadedmetadata', attemptPlay, { once: true });
  mediaEl.addEventListener('canplay', attemptPlay, { once: true });
}

// =========================
// 渲染片段信息
// =========================
function renderActiveMeta(hit) {
  $('activeClipMeta').innerHTML = `
    <div>${getDisplayText(hit)}</div>
    <div class="active-clip-meta-title">
      ${escapeHtml(hit.title || 'Untitled')} · ${formatDuration(hit.duration_precise || hit.duration || 0)}
    </div>
  `;
}

// =========================
// 获取展示文本
// =========================
function getDisplayText(hit) {
  let text =
    hit.highlight?.body?.[0] ||
    hit.body ||
    hit.sentence ||
    '';

  return escapeHtml(String(text))
    .replace(/\[hl\]/g, '<span class="hl">')
    .replace(/\[\/hl\]/g, '</span>');
}

// =========================
// 工具
// =========================
function formatDuration(value) {
  const num = parseFloat(value);
  if (!Number.isFinite(num)) return '0:00';

  const totalSeconds = Math.max(0, Math.round(num));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const escapeAttr = escapeHtml;

// =========================
// 更新搜索信息
// =========================
function updateSearchInfo(json) {
  $('searchTime').textContent = json.time != null ? `${json.time} ms` : '-- ms';
  $('quotaDaily').textContent = json.quota_daily ?? '--';
  $('quotaUsed').textContent = json.quota_daily_used ?? '--';
  $('hitsTotal').textContent = json.hits_total ?? '--';
}


