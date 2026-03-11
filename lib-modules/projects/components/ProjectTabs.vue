<template>
  <div class="w-full border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-black">
    <ScrollableTabContainer
        @keydown="handleKeyDown"
    >
      <CancelButton
          v-if="isInAssignmentMode"
          @click="exitAssignmentMode"
      />

      <AllChatsTab
          :is-selected="projectsStore.selectedProjectId === null"
          @click="projectsStore.selectProject(null)"
      />

      <ProjectTab
          v-for="project in projectsStore.projects"
          :key="project.id"
          :project="project"
          :is-selected="projectsStore.selectedProjectId === project.id"
          :is-in-assignment-mode="isInAssignmentMode && projectsStore.selectedProjectId !== project.id"
          @click="handleProjectClick(project)"
          @rename="showDialog(project, 'rename')"
          @delete="showDialog(project, 'delete')"
          @edit-instructions="showDialog(project, 'editInstructions')"
      />

      <AddProjectButton
          v-if="!isInAssignmentMode"
          @click="showAddDialog = true"
      />

      <ProjectCreateWindow
          v-model:open="showAddDialog"
          @save="onProjectCreated"
      />

      <ProjectRename
          :project="focusedProject"
          v-model:open="renameDialogVisible"
          @save="renameProject($event)"
      />

      <ProjectEditInstructions
          :project="focusedProject"
          v-model:open="editInstructionsVisible"
          @save="editInstructions($event)"
      />


      <ProjectDeleteConfirmation
          :project-title="focusedProject?.title"
          v-model:open="deleteDialogVisible"
          @approve="removeProject"
      />

    </ScrollableTabContainer>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted} from 'vue'
import {type Project, ProjectsModalWindow, type StoreProject} from '../types'
import {useProjects} from '../composables/useProjects'
import AddProjectButton from "./AddProjectButton.vue";
import ProjectTab from "./ProjectTab.vue";
import AllChatsTab from "./AllChatsTab.vue";
import CancelButton from "./CancelButton.vue";
import ScrollableTabContainer from "./ScrollableTabContainer.vue";
import {useConversationAssignment} from '../composables/useConversationAssignment'
import {useProjectsStore} from "~/lib-modules/projects";
import ProjectCreateWindow from "./ProjectCreateWindow.vue";
import ProjectRename from "./ProjectRename.vue";
import ProjectDeleteConfirmation from "./ProjectDeleteConfirmation.vue";
import {toastClientRemoved} from '../helpers/toaster'
import ProjectEditInstructions from "~/lib-modules/projects/components/ProjectEditInstructions.vue";
import {toastChangesSavedSuccess, toastSomeError} from "~/scripts/features/utils/toater";
import {useOnboarding} from "~/lib-modules/onboarding";
import type {Timeout} from "unenv/node/internal/timers/timeout";

const {t} = useI18n()
const onboarding = useOnboarding()
const {assignmentMode, isInAssignmentMode, exitAssignmentMode} = useConversationAssignment()
const {addConversationToProject, createProject} = useProjects()

const projectsStore = useProjectsStore();

const showAddDialog = ref<boolean>(false); // что за showAddDialog - это же для создания проекта состояние...
const renameDialogVisible = ref<boolean>(false);
const editInstructionsVisible = computed({
  get() {
    return projectsStore.modalState[ProjectsModalWindow.EditInstructions]
  },
  set(value: boolean) {
    if (value === editInstructionsVisible.value) return;

    if (value) {
      projectsStore.showModalWindow(ProjectsModalWindow.EditInstructions);
      return;
    }

    projectsStore.hideModalWindow(ProjectsModalWindow.EditInstructions);
  }
})

const deleteDialogVisible = ref<boolean>(false);

const focusedProject = ref<StoreProject | null>(null); // диалог, на котором нажали контекстное меню


const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isInAssignmentMode.value) {
    exitAssignmentMode()
  }
}

const handleProjectClick = async (project: StoreProject) => {
  if (isInAssignmentMode.value && assignmentMode.value.conversationId) {
    await addConversationToProject(project.id, assignmentMode.value.conversationId, assignmentMode.value.conversationTitle!)
    exitAssignmentMode()
  } else {
    projectsStore.selectProject(project.id);
  }
}

const onProjectCreated = async (projectId: string) => {
  // Project already created in ProjectCreateWindow, just refresh the list

  // ну это конено полный пиздец, что у нас в сторе бизнес логика, разъебалово
  await useProjectsStore().fetchProjects()

  // Auto-select the newly created project
  projectsStore.selectProject(projectId)
}

type DialogAction = 'rename' | 'delete' | 'editInstructions'

const showDialog = (project: StoreProject, action: DialogAction) => {
  const actions: { [key in DialogAction]: () => void } = {
    rename: () => {
      renameDialogVisible.value = true;
    },
    delete: () => {
      deleteDialogVisible.value = true;
    },
    editInstructions: async () => {
      const project_ = await useProjects().getProject(project.id);
      if (project_?.customInstructions) {
        project.customInstructions = project_?.customInstructions
      }

      editInstructionsVisible.value = true;
    }
  }

  renameDialogVisible.value = false;
  deleteDialogVisible.value = false;
  editInstructionsVisible.value = false;

  focusedProject.value = project;

  actions[action]();
}

const renameProject = async (newTitle: string) => {
  if (focusedProject.value) {
    try {
      await useProjects().updateProject(focusedProject.value.id, {
        title: newTitle,
        customInstructions: focusedProject.value.customInstructions
      });

      toastChangesSavedSuccess(t);
    } catch (e) {
      toastSomeError(t);
    }
  }
}

const removeProject = async () => {
  if (focusedProject.value) {
    await useProjects().deleteProject(focusedProject.value.id);
    toastClientRemoved(t);
  }
}

const editInstructions = async (instructions: string) => {
  if (focusedProject.value) {
    try {
      await useProjects().updateProject(focusedProject.value.id, {
        title: focusedProject.value.title,
        customInstructions: instructions
      })

      toastChangesSavedSuccess(t);
    } catch (e) {
      toastSomeError(t);
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>
