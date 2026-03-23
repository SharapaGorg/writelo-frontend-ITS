import {computed} from 'vue'
import {useProjectsStore} from '~/lib-modules/projects'
import type {CreateProjectInput, Project, UpdateProjectInput} from '../types'
import {ProjectsApiController} from "../helpers/api";
import {ApiController} from "~/scripts/shared/api/controller";
import {RequestMethod} from "~/scripts/shared/types";
import type {ShortConversationType} from "~/lib-modules/conversations";

export const useProjects = () => {
    const store = useProjectsStore()
    const api = new ProjectsApiController();
    const apiController = new ApiController();

    const currentProjectId = computed(() => store.selectedProjectId)

    const createProject = async (input: CreateProjectInput) => {
        const response = await api.createProject(input.title);
        // Fetch the created project to get its actual ID
        const projects = await api.getProjects();
        const newProject = projects.find(p => p.title === input.title);
        if (newProject) {
            store.addProject(newProject);
        }
        return response;
    }

    const updateProject = async (id: Project['id'], input: UpdateProjectInput) => {
        await api.editProject(id, input.title || "TITLE", input.customInstructions);
        store.updateProject(id, input);
    }

    const deleteProject = async (id: Project['id']) => {
        await api.deleteProject(id);
        store.removeProject(id);
    }

    const selectProject = (projectId: Project['id'] | null) => {
        store.setSelectedProject(projectId)
    }

    const getProject = async (project_id: Project["id"]) => {
        return await api.getProject(project_id);
    }

    /**
     *
     * Assign conversation to the project (conversation can be assigned to one project at a time)
     *
     * @param projectId
     * @param conversationId
     * @param conversationName название беседы, потому что бекендер говноед (Алексей Заварушкин)
     */
    const addConversationToProject = async (
        projectId: Project['id'],
        conversationId: ShortConversationType['privateId'],
        conversationName: ShortConversationType['title']
    ) => {
        await apiController.request(
            `conversations/${conversationId}/`,
            RequestMethod.PATCH,
            {projectId, title: conversationName}
        );

        store.assignConversationToProject(currentProjectId.value!, projectId, conversationId);
        store.setSelectedProject(projectId);
    }

    /**
     * Removes conversation from the project
     * For now conversation can be assigned only to one project, so projectId argument is not necessary, but will be in the future
     *
     * @param projectId
     * @param conversationId
     *
     */
    const removeConversationFromProject = async (projectId: Project['id'], conversationId: ShortConversationType['privateId']) => {
        await apiController.request(
            `conversation/${conversationId}/edit`,
            RequestMethod.POST,
            {project_id: null}
        );
    }

    /**
     * Getting conversation of a projects with offset and number
     *
     * @param projectId
     * @param offset
     * @param limit
     */
    const getProjectConversations = async (projectId: Project['id'], offset: number, limit: number) => {
        return await api.getProjectConversations(projectId, offset, limit);
    }

    return {
        projects: computed(() => store.projects),
        selectedProjectId: computed(() => store.selectedProjectId),
        isLoading: computed(() => store.loading),
        createProject,
        updateProject,
        deleteProject,
        selectProject,
        getProject,
        addConversationToProject,
        removeConversationFromProject,
        getProjectConversations,
    }
}