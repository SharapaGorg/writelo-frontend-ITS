import {defineStore} from 'pinia'
import {ref, reactive, computed, watch} from 'vue'
import {type Project, ProjectsModalWindow, type StoreProject, type UpdateProjectInput} from '../types'
import {ProjectsApiController} from '../helpers/api'
import {getChatsGroupsFormationArray} from '~/scripts/features/conversations/formatting'
import type {
    ChatsGroupsArray,
    ShortConversationType
} from '~/lib-modules/conversations'
import {useConversationsStore} from '~/stores/conversations'
import {moveConversationToFormationArray} from "~/lib-modules/projects";
import {generateRandomHash} from "~/scripts/shared/utils";


export const useProjectsStore = defineStore('projects', () => {
    const projects = ref<StoreProject[]>([])
    const selectedProjectId = ref<string | null>(null)

    const currentConversations = ref<ShortConversationType[]>([])
    const projectsConversations = reactive<Map<Project['id'], ShortConversationType[]>>(new Map())

    // состояния модальных окон
    const modalState: Record<ProjectsModalWindow, boolean> = reactive({
        [ProjectsModalWindow.EditInstructions]: false,
        [ProjectsModalWindow.Create]: false,
        [ProjectsModalWindow.EditTitle]: false
    })


    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)

    const api = new ProjectsApiController()

    // ✅ Новый формат currentGroups
    const currentGroups = computed<ChatsGroupsArray>(() =>
        getChatsGroupsFormationArray(currentConversations.value)
    )

    watch(selectedProjectId, async id => {
        currentConversations.value = []

        if (!id) return

        loading.value = true

        if (projectsConversations.has(id)) {
            currentConversations.value = projectsConversations.get(id)!
            loading.value = false
            return
        }

        const limit = 20
        for (let i = 0; i < 10; i++) {
            const pack = await api.getProjectConversations(id, i * limit, limit)
            if (!pack || pack.length === 0) break
            currentConversations.value.push(...pack)
        }

        projectsConversations.set(id, currentConversations.value)
        loading.value = false
    })

    const showModalWindow = (title: ProjectsModalWindow) => {
        modalState[title] = true;
    }

    const hideModalWindow = (title: ProjectsModalWindow) => {
        modalState[title] = false;
    }

    const fetchProjects = async () => {
        loading.value = true
        try {
            projects.value = await api.getProjects()
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch projects'
        } finally {
            loading.value = false
        }
    }

    const selectProject = (id: Project['id'] | null) => {
        selectedProjectId.value = id
    }


    const addProject = (project: Partial<Project> & { title: Project['title'] }) => {
        /**
         * Добавляет проект в стор
         * Можно закинуть либо только title, либо title и любые другие поля проекта
         */

        const id_ = project.id || generateRandomHash()

        projects.value.push({
            id: id_,
            title: project.title,
            customInstructions: project.customInstructions || "",
            createdAt: project.createdAt || new Date().toISOString(),
            modifiedAt: project.modifiedAt || new Date().toISOString()
        });

        selectProject(id_);
    }


    const assignConversationToProject = (
        previousProject_id: Project['id'] | null,
        project_id: Project['id'],
        conversation_id: ShortConversationType['privateId']
    ) => {
        const conversationsStore = useConversationsStore()

        // достаём старый и новый formation в виде массивов секций
        const oldProjectConvs =
            previousProject_id === null
                ? conversationsStore.conversations
                : projectsConversations.get(previousProject_id) ?? []

        // Проверяем, были ли данные проекта уже загружены
        const targetProjectLoaded = projectsConversations.has(project_id)
        const newProjectConvs = targetProjectLoaded ? projectsConversations.get(project_id)! : []

        const {oldFormation, newFormation} = moveConversationToFormationArray(
            getChatsGroupsFormationArray(oldProjectConvs),
            getChatsGroupsFormationArray(newProjectConvs),
            conversation_id
        )

        // записываем обновлённые обратно в хранилища
        if (previousProject_id === null) {
            conversationsStore.conversations = oldFormation.flatMap(s => s.chats)
        } else {
            projectsConversations.set(previousProject_id, oldFormation.flatMap(s => s.chats))
        }

        // Обновляем кэш проекта только если он был загружен ранее,
        // иначе watch загрузит актуальные данные с сервера
        if (targetProjectLoaded) {
            projectsConversations.set(project_id, newFormation.flatMap(s => s.chats))
        }
    }

    const updateProject = (id: string, updates: UpdateProjectInput) => {
        const i = projects.value.findIndex(p => p.id === id)
        if (i !== -1) projects.value[i] = {...projects.value[i], ...updates}
    }

    const removeProject = (id: Project['id']) => {
        projects.value = projects.value.filter(p => p.id !== id)
        if (selectedProjectId.value === id) selectedProjectId.value = null
    }

    return {
        // state
        projects,
        selectedProjectId,
        loading,
        error,
        currentGroups,
        modalState: computed(() => modalState),
        setSelectedProject: selectProject,
        // actions
        fetchProjects,
        selectProject,
        assignConversationToProject,
        removeProject,
        updateProject,
        addProject,
        showModalWindow,
        hideModalWindow
    }
})
