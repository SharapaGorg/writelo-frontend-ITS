export enum ModeType {
  Business = 'business',
  Programming = 'programming',
  Education = 'education',
  None = 'none'
}

export interface Project {
  id: string;
  name: string;
  mode: ModeType;
  created_at: string;
  updated_at: string;
  conversation_count?: number;
}

export interface ModeConfig {
  type: ModeType;
  title: string;
  icon: string;
  color: string;
  colorClasses: {
    bg: string;
    text: string;
    border: string;
    hover: string;
  };
  description: string;
}

export const MODE_CONFIGS: Record<ModeType, ModeConfig> = {
  [ModeType.Business]: {
    type: ModeType.Business,
    title: 'Business',
    icon: 'briefcase',
    color: 'blue',
    colorClasses: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900'
    },
    description: 'Professional assistance for business tasks'
  },
  [ModeType.Programming]: {
    type: ModeType.Programming,
    title: 'Programming',
    icon: 'code',
    color: 'green',
    colorClasses: {
      bg: 'bg-green-50 dark:bg-green-950',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900'
    },
    description: 'Code writing and technical problem solving'
  },
  [ModeType.Education]: {
    type: ModeType.Education,
    title: 'Education',
    icon: 'graduation-cap',
    color: 'orange',
    colorClasses: {
      bg: 'bg-orange-50 dark:bg-orange-950',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      hover: 'hover:bg-orange-100 dark:hover:bg-orange-900'
    },
    description: 'Learning and educational support'
  },
  [ModeType.None]: {
    type: ModeType.None,
    title: 'No Mode',
    icon: 'x-circle',
    color: 'gray',
    colorClasses: {
      bg: 'bg-gray-50 dark:bg-gray-950',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-800',
      hover: 'hover:bg-gray-100 dark:hover:bg-gray-900'
    },
    description: 'General conversation without specific context'
  }
};