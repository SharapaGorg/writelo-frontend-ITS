import type {Conversation} from "~/data";
import type {ShortConversationType} from "~/lib-modules/conversations";

export * from './store'

export interface Project {
    id: string;
    title: string;
    customInstructions?: string | null;
    createdAt: string;
    modifiedAt: string;
}

export type StoreProject = Pick<Project, 'id' | 'title'> & Partial<Project>

export interface ProjectsState {
    projects: Project[]
    selectedProjectId: string | null
    isLoading: boolean
}

export type CreateProjectInput = Pick<Project, 'title'>
export type UpdateProjectInput = Partial<Omit<Project, 'id'>>

export interface ProjectsApiControllerInterface {
    getProjects(): Promise<Project[]>;

    createProject(title: string): Promise<Project>;

    getProject(project_id: Project['id']): Promise<Project | null>;

    deleteProject(project_id: Project['id']): Promise<void>;

    editProject(project_id: Project['id'], title?: string, custom_instructions?: string): Promise<Project>;

    getProjectConversations(project_id: Project['id'], offset: number, limit: number): Promise<ShortConversationType[]>

}


