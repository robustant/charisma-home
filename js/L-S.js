// =========================
// 配置区
// =========================

// Voicecup API
const API_URL = 'https://voicecup.com/api';
const API_KEY = 'Y5WUMRKYd8'; 
const API_LANG = 'eng';

// 自动播放配置
const AUTO_PLAY = true;
const YOUTUBE_AUTOPLAY_MUTED = false; // YouTube 自动播放是否静音，避免部分浏览器限制自动播放

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
// 初始化
// =========================
document.addEventListener('DOMContentLoaded', function () {
  loadYouTubeApi();

  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  searchBtn.addEventListener('click', handleSearch);

  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
});

// =========================
// 加载 YouTube Iframe API
// =========================
function loadYouTubeApi() {
  if (window.YT && window.YT.Player) {
    youtubeApiReady = true;
    return;
  }

  if (!document.getElementById('youtube-iframe-api')) {
    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }

  window.onYouTubeIframeAPIReady = function () {
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
  const keyword = document.getElementById('searchInput').value.trim();
  updateDictionaryLinks(keyword);

  if (!keyword) {
    renderError('请输入 a word or phrase');
    return;
  }

  stopAllPlayback();
  renderLoading();

  searchVoicecup(keyword);
}

// =========================
// Voicecup 搜索
// 官方 demo 是 jsonp + jQuery.ajax
// =========================
function searchVoicecup(keyword) {
  if (typeof window.jQuery === 'undefined') {
    renderError('缺少 jQuery。Voicecup 官方 JSONP 调用依赖 jQuery。');
    return;
  }

  if (xhrSearchText) {
    xhrSearchText.abort();
  }

  xhrSearchText = window.jQuery.ajax({
    type: 'POST',
    url: API_URL,
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
    dataType: 'jsonp',
    jsonp: 'callback',
    crossDomain: true,
    cache: false,
    beforeSend: function (xhr) {
      if (xhr && xhr.overrideMimeType) {
        xhr.overrideMimeType('text/plain; charset=utf-8');
      }
    },
    success: function (json) {
      handleSearchSuccess(json);
      updateSearchInfo(json);
    },
    error: function (_jqXHR, textStatus) {
      if (textStatus === 'abort') return;
      renderError('Error executing search script: ' + textStatus);
    }
  });
}

// =========================
// 搜索成功处理
// =========================
function handleSearchSuccess(json) {
  if (!json) {
    renderError('接口返回为空');
    return;
  }

  if (json.res === 'error') {
    const errors = Array.isArray(json.errors) ? json.errors.join('；') : '接口返回错误';
    renderError(errors);
    return;
  }

  const hits = Array.isArray(json.hits) ? json.hits : [];

  if (!hits.length || json.hits_total === 0) {
    currentHits = [];
    document.getElementById('clipList').innerHTML =
      '<div class="clip-empty">Nothing was found</div>';

    document.getElementById('activeVideoPlayer').innerHTML =
      '<div class="empty-player">暂无视频结果</div>';

    document.getElementById('activeAudioPlayer').innerHTML = '';
    document.getElementById('activeClipMeta').textContent = '暂无片段信息';
    return;
  }

  currentHits = hits;
  renderClipList(hits);
  setActiveClip(0);
}

// =========================
// 加载态
// =========================
function renderLoading() {
  document.getElementById('clipList').innerHTML =
    '<div class="loading-box">正在搜索 clips...</div>';

  document.getElementById('activeVideoPlayer').innerHTML =
    '<div class="empty-player">正在加载视频...</div>';

  document.getElementById('activeAudioPlayer').innerHTML = '';
  document.getElementById('activeClipMeta').textContent = '请稍候...';
}

// =========================
// 错误态
// =========================
function renderError(message) {
  document.getElementById('clipList').innerHTML =
    `<div class="error-box">${escapeHtml(message)}</div>`;

  document.getElementById('activeVideoPlayer').innerHTML =
    '<div class="empty-player">请先完成搜索</div>';

  document.getElementById('activeAudioPlayer').innerHTML = '';
  document.getElementById('activeClipMeta').textContent = '当前片段信息将显示在这里';
}

// =========================
// 渲染右侧 clips
// =========================
function renderClipList(hits) {
  const clipList = document.getElementById('clipList');
  clipList.innerHTML = '';

  hits.forEach((hit, index) => {
    const item = document.createElement('div');
    item.className = 'clip-item';
    item.dataset.index = String(index);

    const textHtml = getDisplayText(hit);
    const duration = formatDuration(hit.duration_precise || hit.duration || 0);

    item.innerHTML = `
      <div class="clip-icon">▶</div>
      <div class="clip-text">${textHtml}</div>
      <div class="clip-duration">${duration}</div>
    `;

    item.addEventListener('click', function () {
      setActiveClip(index);
    });

    clipList.appendChild(item);
  });
}

// =========================
// 切换 clip
// =========================
function setActiveClip(index) {
  const hit = currentHits[index];
  if (!hit) return;

  stopAllPlayback();

  document.querySelectorAll('.clip-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeItem = document.querySelector(`.clip-item[data-index="${index}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    activeItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
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

  const videoEl = document.querySelector('#activeVideoPlayer video');
  if (videoEl) {
    try {
      videoEl.pause();
    } catch (e) {}
  }

  const audioEl = document.querySelector('#activeAudioPlayer audio');
  if (audioEl) {
    try {
      audioEl.pause();
    } catch (e) {}
  }

  if (youtubePlayer && typeof youtubePlayer.stopVideo === 'function') {
    try {
      youtubePlayer.stopVideo();
    } catch (e) {}
  }
}

// =========================
// 渲染主视频
// 逻辑优先级：
// 1. youtube_info 存在 -> YouTube
// 2. file_ready == 1 且 filename_audio 存在 -> Voicecup 服务端视频片段
// 3. video_url -> 普通 video
// 4. 无视频
// =========================
function renderActiveVideo(hit) {
  const container = document.getElementById('activeVideoPlayer');

  // YouTube 优先
  if (hit.youtube_info && hit.youtube_info.video_id) {
    container.innerHTML = '<div id="youtube-player-host" style="width:100%;height:100%;"></div>';

    if (!youtubeApiReady) {
      youtubePendingHit = hit;
      return;
    }

    renderYoutubePlayer(hit);
    return;
  }

  // Voicecup 服务端视频
  if (Number(hit.file_ready) === 1 && hit.filename_audio) {
    const start = hit.start_precise ?? hit.start ?? 0;
    const duration = hit.duration_precise ?? hit.duration ?? 0;
    const subsId = hit.id || '';

    const mp4Url =
      `https://voicecup.com/play?key=${encodeURIComponent(API_KEY)}&video=1&filename=${encodeURIComponent(hit.filename_audio)}&filetype=mp4&start=${encodeURIComponent(start)}&duration=${encodeURIComponent(duration)}&subs_id=${encodeURIComponent(subsId)}&app_name=voicecup.com`;

    const webmUrl =
      `https://voicecup.com/play?key=${encodeURIComponent(API_KEY)}&video=1&filename=${encodeURIComponent(hit.filename_audio)}&filetype=webm&start=${encodeURIComponent(start)}&duration=${encodeURIComponent(duration)}&subs_id=${encodeURIComponent(subsId)}&app_name=voicecup.com`;

    container.innerHTML = `
      <video id="mainVideoEl" controls preload="metadata" controlsList="nodownload" playsinline ${AUTO_PLAY ? 'muted' : ''}>
        <source src="${mp4Url}" type="video/mp4">
        <source src="${webmUrl}" type="video/webm">
        您的浏览器不支持 video 标签
      </video>
    `;

    const videoEl = document.getElementById('mainVideoEl');
    bindMediaSegmentStop(videoEl, Number(duration));
    safeAutoplay(videoEl);
    return;
  }

  // 普通 video_url 兜底
  if (hit.video_url) {
    container.innerHTML = `
      <video id="mainVideoEl" controls preload="metadata" playsinline ${AUTO_PLAY ? 'muted' : ''}>
        <source src="${escapeAttr(hit.video_url)}" type="video/mp4">
        您的浏览器不支持 video 标签
      </video>
    `;

    const videoEl = document.getElementById('mainVideoEl');
    safeAutoplay(videoEl);
    return;
  }

  container.innerHTML = '<div class="empty-player">该 clip 暂无视频资源</div>';
}

// =========================
// 渲染 YouTube
// 参考官方 demo：
// - 用 YT.Player
// - 指定 start / end
// - 结束时 seekTo(start) 并 pause
// =========================
function renderYoutubePlayer(hit) {
  const hostId = 'youtube-player-host';
  const host = document.getElementById(hostId);
  if (!host || !window.YT || !window.YT.Player) return;

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
      onReady: function (event) {
        if (AUTO_PLAY) {
          try {
            if (YOUTUBE_AUTOPLAY_MUTED && event.target.mute) {
              event.target.mute();
            }
            event.target.playVideo();
          } catch (e) {}
        }
      },
      onStateChange: function (event) {
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
// 逻辑：
// - file_ready == 1 且 filename_audio 存在时展示 Voicecup 片段音频
// - 如果当前已是 YouTube / Video，不强制自动播 audio，避免双重播放
// =========================
function renderActiveAudio(hit) {
  const container = document.getElementById('activeAudioPlayer');

  if (!(Number(hit.file_ready) === 1 && hit.filename_audio)) {
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
    return;
  }

  const start = hit.start_precise ?? hit.start ?? 0;
  const duration = hit.duration_precise ?? hit.duration ?? 0;
  const subsId = hit.id || '';

  const mp4Url =
    `https://voicecup.com/play?key=${encodeURIComponent(API_KEY)}&filename=${encodeURIComponent(hit.filename_audio)}&filetype=mp4&start=${encodeURIComponent(start)}&duration=${encodeURIComponent(duration)}&subs_id=${encodeURIComponent(subsId)}&app_name=voicecup.com`;

  const webmUrl =
    `https://voicecup.com/play?key=${encodeURIComponent(API_KEY)}&filename=${encodeURIComponent(hit.filename_audio)}&filetype=webm&start=${encodeURIComponent(start)}&duration=${encodeURIComponent(duration)}&subs_id=${encodeURIComponent(subsId)}&app_name=voicecup.com`;

  container.innerHTML = `
    <audio id="mainAudioEl" controls preload="metadata" controlsList="nodownload">
      <source src="${mp4Url}" type="audio/mp4">
      <source src="${webmUrl}" type="audio/webm">
      您的浏览器不支持 audio 标签
    </audio>
  `;

  // 只有在“没有视频资源”的情况下，音频才自动播放
  const hasVideo =
    !!(hit.youtube_info && hit.youtube_info.video_id) ||
    (Number(hit.file_ready) === 1 && !!hit.filename_audio) ||
    !!hit.video_url;

  if (!hasVideo) {
    const audioEl = document.getElementById('mainAudioEl');
    bindMediaSegmentStop(audioEl, Number(duration));
    safeAutoplay(audioEl);
  }
}

// =========================
// 绑定片段时长结束
// 因为 Voicecup play 是按片段返回，理论上会自然结束，
// 这里做一层保险：超时后 pause 并归零
// =========================
function bindMediaSegmentStop(mediaEl, duration) {
  if (!mediaEl || !duration || duration <= 0) return;

  mediaEl.addEventListener('play', function () {
    if (youtubeStopTimer) {
      clearTimeout(youtubeStopTimer);
    }

    youtubeStopTimer = setTimeout(function () {
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

  const attemptPlay = function () {
    try {
      const p = mediaEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {});
      }
    } catch (e) {}
  };

  mediaEl.addEventListener('loadedmetadata', attemptPlay, { once: true });
  mediaEl.addEventListener('canplay', attemptPlay, { once: true });
}

// =========================
// 渲染片段信息
// =========================
function renderActiveMeta(hit) {
  const container = document.getElementById('activeClipMeta');
  const textHtml = getDisplayText(hit);
  const title = hit.title || 'Untitled';
  const duration = formatDuration(hit.duration_precise || hit.duration || 0);

  container.innerHTML = `
    <div>${textHtml}</div>
    <div class="active-clip-meta-title">${escapeHtml(title)} · ${duration}</div>
  `;
}

// =========================
// 获取展示文本
// 参考官方 demo 的 body/highlight 逻辑
// =========================
function getDisplayText(hit) {
  let text = '';

  if (hit.highlight && hit.highlight.body && hit.highlight.body[0]) {
    text = hit.highlight.body[0];
  } else if (hit.body) {
    text = hit.body;
  } else if (hit.sentence) {
    text = hit.sentence;
  }

  text = String(text || '');
  text = escapeHtml(text);
  text = text.replace(/\[hl\]/g, '<span class="hl">');
  text = text.replace(/\[\/hl\]/g, '</span>');

  return text;
}

// =========================
// 工具：格式化时长
// =========================
function formatDuration(value) {
  const num = parseFloat(value);
  if (!Number.isFinite(num)) return '0:00';

  const totalSeconds = Math.max(0, Math.round(num));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// =========================
// 工具：转义
// =========================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}

// =========================
// 插入词典链接
// =========================    
function updateDictionaryLinks(word) {
  const encodedWord = encodeURIComponent(word.trim());

  document.getElementById('longmanLink').href =
    `https://www.ldoceonline.com/dictionary/${encodedWord}`;

  document.getElementById('oxfordLink').href =
    `https://www.oxfordlearnersdictionaries.com/definition/english/${encodedWord}`;

  document.getElementById('cambridgeLink').href =
    `https://dictionary.cambridge.org/dictionary/english/${encodedWord}`;
}


// =========================
// 插入搜索信息 
// =========================    
function updateSearchInfo(json) {
  document.getElementById('searchTime').textContent =
    json.time != null ? `${json.time} ms` : '-- ms';

  document.getElementById('quotaDaily').textContent =
    json.quota_daily != null ? json.quota_daily : '--';

  document.getElementById('quotaUsed').textContent =
    json.quota_daily_used != null ? json.quota_daily_used : '--';

  document.getElementById('hitsTotal').textContent =
    json.hits_total != null ? json.hits_total : '--';
}