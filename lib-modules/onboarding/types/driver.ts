export type OnboardingItem = {
    $el: string // айдишник элемента
    title: string
    description: string
    needClick?: boolean,
    externalAction?: boolean, // если true, то значит, что онбординг элемент кастомно обрабатывается в другом месте
    waitForState?: Ref<boolean> // если онбординг элемент ждет переключения какой-либо переменной (сейчас будем считать, что нужно ждать ее значения false)
    requiresFeature?: string // если указано, шаг показывается только если у пользователя есть эта фича
}

export type OnboardingPopoverData = {
    title: string
    description: string
    showPrevious?: boolean
    showNext?: boolean
    showDone?: boolean
    fixedTop?: boolean
    fixedBottom?: boolean
}

// Localized button texts
export const ONBOARDING_BUTTONS = {
  ru: {
    done: 'Завершить',
    next: 'Далее',
    previous: 'Назад',
    cancel: 'Отмена',
    progress: '{{current}} из {{total}}'
  },
  en: {
    done: 'Done',
    next: 'Next',
    previous: 'Previous',
    cancel: 'Cancel',
    progress: '{{current}} of {{total}}'
  }
}

// Localized onboarding items
export const ONBOARDING_ITEMS_LOCALIZED = {
  ru: [
    {
      $el: "search-button",
      title: "Поиск в интернете",
      description: "<p>Нажмите на эту кнопку-переключатель для активации поиска в интернете. После включения поиск применится к следующему сообщению.</p><p>Нажмите «Далее» для продолжения.</p>",
    },
    {
      $el: 'roles-button',
      title: "Роли ассистента",
      description: "<p>Здесь можно выбрать специализацию ИИ: программист, маркетолог, переводчик и другие.</p><p> Роль влияет на стиль и направленность ответов.</p><p>Нажмите кнопку для продолжения.</p>",
      needClick: true
    },
    {
      $el: "roles-section",
      title: "Роли",
      description: "<p>В этом меню можно посмотреть список ролей, примеры диалогов с ними и выбрать понравившуюся.</p><p>Для продолжения закройте панель, потянув ее вниз за верхний край.</p>",
      waitForState: useEnv().rolesSectionOpened,
    },
    {
      $el: "settings-button",
      title: "Настройки ассистента",
      description: "Нажмите на эту кнопку, чтобы открыть меню настроек. Там вы сможете выбрать языковую модель, стиль ответов и посмотреть остаток запросов.",
      needClick: true
    },
    {
      $el: "settings-section",
      title: "Настройки",
      description: "Попробуйте изменить языковую модель, язык интерфейса или стиль ответов, затем закройте меню настроек для продолжения.",
      waitForState: useEnv().settingsMenuOpened,
    },
    {
      $el: "dialogs-button",
      title: "Диалоги",
      description: "Нажмите на эту кнопку, чтобы открыть историю бесед и увидеть, как можно организовать их в проекты.",
      needClick: true
    },
    {
      $el: "add-project-button",
      title: "Новый проект",
      description: "Нажмите кнопку «+», чтобы создать проект для группировки диалогов по теме.",
      needClick: true,
      requiresFeature: 'projects'
    },
    {
      $el: "project-create-modal",
      title: "Название проекта",
      description: "Введите название проекта (например: «SMM: NeoVision тг канал» или «Готовка») и нажмите кнопку создания.",
      externalAction: true,
      requiresFeature: 'projects'
    },
    {
      $el: "project-tab",
      title: "Управление проектом",
      description: "Кликните правой кнопкой мыши по вкладке проекта (на телефоне — долгое нажатие), чтобы открыть контекстное меню.",
      externalAction: true,
      requiresFeature: 'projects'
    },
    {
      $el: "project-context-menu",
      title: "Контекстное меню",
      description: "Нажмите на пункт «Редактировать инструкции», чтобы настроить поведение ИИ для этого проекта.",
      externalAction: true,
      requiresFeature: 'projects'
    },
    {
      $el: "project-edit-instructions-modal",
      title: "Инструкции проекта",
      description: "<p>Опишите контекст проекта и желаемое поведение ИИ — данные инструкции будут применены ко всем диалогам в проекте.</p>",
      requiresFeature: 'projects'
    }
  ],
  en: [
    {
      $el: "search-button",
      title: "Internet Search",
      description: "<p>Click this toggle button to activate internet search. Once enabled, search will be applied to the next message.</p><p>Click \"Next\" to continue.</p>",
    },
    {
      $el: 'roles-button',
      title: "Assistant Roles",
      description: "<p>Here you can select AI specialization: programmer, marketer, translator and others. Role affects the style and direction of responses.</p><p>Click the button to continue.</p>",
      needClick: true
    },
    {
      $el: "roles-section",
      title: "Roles",
      description: "<p>In this menu you can view the list of roles, example dialogs with them and select the one you like.</p><p>To continue, close the panel by pulling it down by the top edge.</p>",
      waitForState: useEnv().rolesSectionOpened,
    },
    {
      $el: "settings-button",
      title: "Assistant Settings",
      description: "Click this button to open the settings menu. There you can select a language model, response style and view remaining requests.",
      needClick: true
    },
    {
      $el: "settings-section",
      title: "Settings",
      description: "Try changing the language model, interface language or response style, then close the settings menu to continue.",
      waitForState: useEnv().settingsMenuOpened,
    },
    {
      $el: "dialogs-button",
      title: "Dialogs",
      description: "Click this button to open conversation history and see how they can be organized into projects.",
      needClick: true
    },
    {
      $el: "add-project-button",
      title: "New Project",
      description: "Click the \"+\" button to create a project for grouping dialogs by topic.",
      needClick: true,
      requiresFeature: 'projects'
    },
    {
      $el: "project-create-modal",
      title: "Project Name",
      description: "Enter a project name (for example: \"SMM: NeoVision tg channel\" or \"Cooking\") and click the create button.",
      externalAction: true,
      requiresFeature: 'projects'
    },
    {
      $el: "project-tab",
      title: "Project Management",
      description: "Right-click on the project tab (on phone - long press) to open the context menu.",
      externalAction: true,
      requiresFeature: 'projects'
    },
    {
      $el: "project-context-menu",
      title: "Context Menu",
      description: "Click on \"Edit Instructions\" to configure AI behavior for this project.",
      externalAction: true,
      requiresFeature: 'projects'
    },
    {
      $el: "project-edit-instructions-modal",
      title: "Project Instructions",
      description: "<p>Describe the project context and desired AI behavior — these instructions will be applied to all dialogs in the project.</p>",
      requiresFeature: 'projects'
    }
  ]
}

export const ONBOARDING_ITEMS: OnboardingItem[] = [
    {
        $el: "search-button",
        title: "Поиск в интернете",
        description: "<p>Нажмите на эту кнопку-переключатель для активации поиска в интернете. После включения поиск применится к следующему сообщению.</p><p>Нажмите «Далее» для продолжения.</p>",
    },
    // todo: сделать доп этап для открытия менюшки ролей
    {
        $el: 'roles-button',
        title: "Роли ассистента",
        description: "<p>Здесь можно выбрать специализацию ИИ: программист, маркетолог, переводчик и другие. Роль влияет на стиль и направленность ответов.</p><p>Нажмите кнопку для продолжения.</p>",
        needClick: true
    },
    {
        $el: "roles-section",
        title: "Роли",
        description: "<p>В этом меню можно посмотреть список ролей, примеры диалогов с ними и выбрать понравившуюся.</p><p>Для продолжения закройте панель, потянув ее вниз за верхний край.</p>",
        waitForState: useEnv().rolesSectionOpened,
    },
    {
        $el: "settings-button",
        title: "Настройки ассистента",
        description: "Нажмите на эту кнопку, чтобы открыть меню настроек. Там вы сможете выбрать языковую модель, стиль ответов и посмотреть остаток запросов.",
        needClick: true
    },
    {
        $el: "settings-section",
        title: "Настройки",
        description: "Попробуйте изменить языковую модель, язык интерфейса или стиль ответов, затем закройте меню настроек для продолжения.",
        waitForState: useEnv().settingsMenuOpened,
    },
    {
        $el: "dialogs-button",
        title: "Диалоги",
        description: "Нажмите на эту кнопку, чтобы открыть историю бесед и увидеть, как можно организовать их в проекты.",
        needClick: true
    },
    {
        $el: "add-project-button",
        title: "Новый проект",
        description: "Нажмите кнопку «+», чтобы создать проект для группировки диалогов по теме.",
        needClick: true,
        requiresFeature: 'projects'
    },
    {
        $el: "project-create-modal",
        title: "Название проекта",
        description: "Введите название проекта (например: «SMM: NeoVision тг канал» или «Готовка») и нажмите кнопку создания.",
        externalAction: true,
        requiresFeature: 'projects'
    },
    {
        $el: "project-tab",
        title: "Управление проектом",
        description: "Кликните правой кнопкой мыши по вкладке проекта (на телефоне — долгое нажатие), чтобы открыть контекстное меню.",
        externalAction: true,
        requiresFeature: 'projects'
    },
    {
        $el: "project-context-menu",
        title: "Контекстное меню",
        description: "Нажмите на пункт «Редактировать инструкции», чтобы настроить поведение ИИ для этого проекта.",
        externalAction: true,
        requiresFeature: 'projects'
    },
    {
        $el: "project-edit-instructions-modal",
        title: "Инструкции проекта",
        description: "<p>Опишите контекст проекта и желаемое поведение ИИ — данные инструкции будут применены ко всем диалогам в проекте.</p>",
        requiresFeature: 'projects'
    }
    // todo: Попросить Лешу автоматически создавать человеку стартовый диалог, чтобы потом можно было в онбординге еще и показать, как диалог в проект засовывать
]