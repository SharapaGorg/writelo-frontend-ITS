// Dev-only fixture for the v2 analyser response. Surfaced when the detail
// page is opened with `?mock=v2`. Lets designers/devs see the new layout
// without waiting for the backend to ship v2.

import type { ShortVideoAnalysisDto } from '../types'

export const V2_MOCK_ANALYSIS_ID = 'mock-v2'

// Mirror the real wire format from CHANGES.md: snake_case for the new v2
// blobs (`content_axes`, `viral_drivers`, `virality_summary_ru`,
// `analyzer_version`) and per-axis `category`. The defensive `pickField`
// readers in VideoAnalysisDetail.vue handle either casing, but the mock
// must mirror the real shape so `?mock=v2` exercises the same code path.
export const V2_MOCK_DETAIL: ShortVideoAnalysisDto & {
  content_axes?: unknown
  viral_drivers?: unknown
  virality_summary_ru?: string
  analyzer_version?: number
} = {
  id: V2_MOCK_ANALYSIS_ID,
  socialVideoEntryId: 'mock-entry',
  platform: 'instagram',
  title: 'Reel: «3 ошибки, которые крадут твой подход»',
  originalUrl: 'https://www.instagram.com/reel/MOCKv2example/',
  normalizedUrl: 'https://www.instagram.com/reel/MOCKv2example/',
  previewObjectId: null,
  previewImage: null,
  analyzerVersion: 2,
  analyzer_version: 2,
  model: 'mock',
  status: 'completed',
  analyzedAt: new Date().toISOString(),

  transcription: {
    speech:
      'Если ты до сих пор делаешь приседания вот так — стоп. Я три года ставил технику и видел эти три ошибки у каждого второго. Смотри до конца, на третьей я сам долго залипал. Первая: колени уезжают внутрь. Вторая: спина круглится в нижней точке. Третья — и это самое жирное — ты не дышишь животом, а грудью, поэтому теряешь стабильность. Сохрани, чтобы не забыть.',
    source_language: 'ru',
    on_screen_text:
      'ОШИБКА №1: КОЛЕНИ ВНУТРЬ · ОШИБКА №2: КРУГЛАЯ СПИНА · ОШИБКА №3: ДЫХАНИЕ',
    on_screen_text_original: null,
    unclear_parts: null,
  },

  summary: {
    topic_ru: '3 главные ошибки в технике приседания',
    essence_ru:
      'Тренер с трёхлетним опытом разбирает три самые частые ошибки в приседе: колени внутрь, круглая спина и грудное дыхание. Подача — короткая, плотная, с прямым обращением и сохранят-CTA в финале.',
    short_description_ru:
      'Автор стоит на нейтральном фоне зала, на стенде штанга. Каждые 2–3 секунды — крупный текст с номером ошибки и быстрый zoom-in на соответствующую часть тела. В конце — стрелка вверх «Сохрани».',
  },

  tags: {
    formats: ['mistake_analysis', 'expert_explanation'],
    niches: ['fitness_sport', 'self_development_productivity'],
  },

  // v2 structure is a 3-item array (hook / main / ending).
  structure: [
    { label: '0–3 сек', step_ru: 'Резкий стоп-кадр «стоп» крупным планом + текстовый крючок «3 ошибки, которые крадут твой подход».' },
    { label: '3–22 сек', step_ru: 'Три блока с зумом на ошибку, текстовая нумерация, быстрая смена планов каждые 2–3 секунды.' },
    { label: '22–28 сек', step_ru: 'Финальная фраза «сохрани, чтобы не забыть» + стрелка вверх и иконка «закладка».' },
  ],

  hooks: {
    spoken_hook_ru: 'Если ты до сих пор делаешь приседания вот так — стоп.',
    spoken_hook_original: null,
    visual_hook_ru: 'Резкий стоп-кадр с поднятой ладонью и крупным «СТОП» на экране.',
    text_hook_ru: '3 ошибки, которые крадут твой подход',
  },

  funnel: {
    cta_voice_ru: 'Сохрани, чтобы не забыть.',
    cta_visual_ru: 'Стрелка вверх + иконка закладки в правом нижнем углу.',
    traffic_destination: 'instagram_profile_visit',
    lead_magnet: false,
  },

  // v2 improvements: flat, axis-tied, with priority + expected_gain.
  improvements: [
    {
      axis: 'cta',
      current_score: 38,
      current_level: 'poor',
      priority: 'high',
      action_ru:
        'На 24-й секунде, после слова «закладка», добавить голосом одну строку: «А подпишись, если хочешь второй разбор по становой» — без неё CTA уходит только в Save, не работает на подписку.',
      expected_gain_ru: 'Поднимет ось из poor в average, +15–20 баллов и должно выровнять воронку.',
    },
    {
      axis: 'hook',
      current_score: 52,
      current_level: 'average',
      priority: 'high',
      action_ru:
        'Первый кадр — лицо в нейтральной мимике. Замени на крупный план коленей с уже идущей ошибкой и наложи «вот так делать нельзя». Зритель сразу видит проблему, а не автора.',
      expected_gain_ru: 'Average → good, ожидаем +12–18 баллов на хуке и заметный рост 3-сек удержания.',
    },
    {
      axis: 'storytelling',
      current_score: 55,
      current_level: 'average',
      priority: 'high',
      action_ru:
        'На третьей ошибке ты сам говоришь «я долго залипал», но не показываешь свой случай. Вставь 2-секундную вставку «вот как я делал раньше» — это закроет открытую петлю личным payoff.',
      expected_gain_ru: 'Average → good, +10–15 баллов на сторителлинге и плюс к completion rate.',
    },
    {
      axis: 'retention',
      current_score: 62,
      current_level: 'good',
      priority: 'medium',
      action_ru:
        'Между ошибкой №2 и №3 (≈14 сек) фон не меняется, темп проседает. Вставь короткий 0.5-сек кадр с штангой или mirror-flip — паттерн-интерапт, чтобы закрыть провисание середины.',
      expected_gain_ru: 'Чистый бонус +5–8 баллов и +3–5% к среднему досматриванию.',
    },
    {
      axis: 'comment_trigger',
      current_score: 41,
      current_level: 'average',
      priority: 'medium',
      action_ru:
        'В финале добавь провокацию: «у кого из вас третья — пишите 3 в комментариях». Сейчас вообще нет повода написать.',
      expected_gain_ru: 'Average → good, ожидаем заметный скачок comment rate.',
    },
  ],

  content_axes: {
    hook: {
      score: 52,
      category: 'average',
      analysis_ru:
        'Текстовый крючок «3 ошибки, которые крадут твой подход» хорош, но первый кадр (лицо тренера в нейтральной мимике) визуально слабый. Спасает быстрая речь и стоп-кадр на 1-й секунде.',
    },
    retention: {
      score: 62,
      category: 'good',
      analysis_ru:
        'Три открытые петли по числу ошибок плюс паттерн-интерапт через зум каждые 2–3 секунды. Лёгкое провисание около 14-й секунды между ошибкой №2 и №3.',
    },
    storytelling: {
      score: 55,
      category: 'average',
      analysis_ru:
        'Структура «было плохо → вот три причины → сохрани» считывается, но без личного payoff. Фраза «я сам долго залипал» висит без визуального подтверждения.',
    },
    structure: {
      score: 71,
      category: 'good',
      analysis_ru:
        'Чёткое деление 0–3 / 3–22 / 22–28 сек, концовка не обрывается. Тело уложено в три равных блока — читается как чек-лист.',
    },
    save_worthiness: {
      score: 78,
      category: 'good',
      analysis_ru:
        'Конкретный чек-лист из трёх проверяемых пунктов + прямой призыв «сохрани». Высокая референсная ценность для целевой аудитории.',
    },
    comment_trigger: {
      score: 41,
      category: 'average',
      analysis_ru:
        'Нет прямого вопроса к зрителю, нет поляризации. Возможны редкие комментарии «спасибо», но мощного триггера к спору или диалогу нет.',
    },
    loop: {
      score: 35,
      category: 'poor',
      analysis_ru:
        'Финальный кадр (стрелка + закладка на нейтральном фоне) не стыкуется с первым кадром (лицо тренера). Re-watch не закладывается.',
    },
    persona: {
      score: 68,
      category: 'good',
      analysis_ru:
        'Узнаваемая манера: прямое «ты», конкретные числа, отсылка к личному опыту. Стиль речи последовательный, легко идентифицируется как «тренер-фактчекер».',
    },
    voice: {
      score: 74,
      category: 'good',
      analysis_ru:
        'Темп быстрый, артикуляция чистая, паузы расставлены под зумы. Эмоциональная амплитуда узкая, но соответствует экспертной подаче.',
    },
    aesthetic: {
      score: 64,
      category: 'good',
      analysis_ru:
        'Спокойная палитра зала, контрастный белый текст крупным шрифтом, читается со смартфона без зума. Стиль не вирусный, но опрятный.',
    },
    production: {
      score: 81,
      category: 'excellent',
      analysis_ru:
        'Фокус и экспозиция стабильны, звук без шума, синхрон точный. Размер текста безопасный для всех ориентаций.',
    },
    cta: {
      score: 38,
      category: 'poor',
      analysis_ru:
        'Призыв ограничен «сохрани». Нет фразы про подписку, нет визуального триггера на профиль. Воронка работает только на сохранения.',
    },
  },

  viral_drivers: [
    {
      driver: 'utility_save_worthy',
      driver_evidence_ru:
        'Три проверяемых пункта и прямой призыв «сохрани, чтобы не забыть» на 24-й секунде. Чек-лист удобно сохранить в подборку «спорт».',
    },
    {
      driver: 'identity_relatability',
      driver_evidence_ru:
        '«У каждого второго» на 7-й секунде + личная ремарка «я сам долго залипал» на третьей ошибке. Зритель узнаёт себя.',
    },
    {
      driver: 'curiosity_gap',
      driver_evidence_ru:
        'Фраза «на третьей я сам долго залипал» (≈9 сек) — отложенная петля, которая заставляет досматривать до 22-й секунды.',
    },
  ],

  virality_summary_ru:
    'Ролик попадает по utility-маршруту: целевая аудитория сохранит ради чек-листа. Узнаваемость и открытая петля поддержат среднее досматривание, но потолок виральности упирается в слабый CTA на подписку и неработающий loop — поэтому скорее «хорошо разойдётся в нише», чем «залетит в общий рекомендации».',

  diagnostics:
    'Mock-фикстура v2. Никаких неясных мест в речи; CTA-ось понижена осознанно для демонстрации high-priority improvement.',
}

export const V2_MOCK_HISTORY_ITEM = {
  id: V2_MOCK_ANALYSIS_ID,
  socialVideoEntryId: V2_MOCK_DETAIL.socialVideoEntryId,
  shortVideoAnalysisId: V2_MOCK_ANALYSIS_ID,
  platform: V2_MOCK_DETAIL.platform,
  title: V2_MOCK_DETAIL.title,
  originalUrl: V2_MOCK_DETAIL.originalUrl,
  normalizedUrl: V2_MOCK_DETAIL.normalizedUrl,
  previewObjectId: null,
  previewImage: null,
  status: 'completed' as const,
  errorCode: null,
  errorMessage: null,
  requestedAt: V2_MOCK_DETAIL.analyzedAt ?? new Date().toISOString(),
  completedAt: V2_MOCK_DETAIL.analyzedAt,
}
