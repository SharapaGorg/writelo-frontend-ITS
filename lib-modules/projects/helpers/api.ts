import {ApiController} from "~/scripts/shared/api/controller";
import type {Conversation} from "~/data";
import {RequestMethod, ApiAliases} from "~/scripts/shared/types";
import type {ProjectsApiControllerInterface, Project} from "../types";
import type {ShortConversationType} from "~/lib-modules/conversations";


export class ProjectsApiController extends ApiController implements ProjectsApiControllerInterface {
    createProject(title: string): Promise<Project> {
        return this.request(ApiAliases.projects, RequestMethod.POST, {title: title});
    }

    deleteProject(project_id: Project["id"]): Promise<void> {
        return this.request(`${ApiAliases.projects}/${project_id}`, RequestMethod.DELETE);
    }

    editProject(project_id: Project["id"], title: string, custom_instructions: string | null = null): Promise<Project> {
        return this.request(`${ApiAliases.projects}/${project_id}`, RequestMethod.PATCH, {
            title: title,
            customInstructions: custom_instructions
        });
    }

    getProject(project_id: Project["id"]): Promise<Project | null> {
        return this.request(`${ApiAliases.projects}/${project_id}`);
    }

    getProjectConversations(project_id: Project["id"], offset: number, limit: number): Promise<ShortConversationType[]> {
        // This endpoint is not in v1 spec, using conversations endpoint with projectId filter
        return this.request(`${ApiAliases.conversations}?offset=${offset}&limit=${limit}&projectId=${project_id}`);
    }

    getProjects(): Promise<Project[]> {
        return this.request(ApiAliases.projects);
    }
}