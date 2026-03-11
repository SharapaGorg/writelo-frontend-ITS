<template>
  <Drawer v-model:open="isDrawerOpened">
    <DrawerTrigger>
      <div id="roles-button">
        <Button
            variant="outline"
            class="rounded-3xl h-9 max-w-[160px] md:max-w-full whitespace-nowrap overflow-hidden"
            :style="{
              backgroundColor: !rolesOff ? '#3B82F64C' : '',
              color: !rolesOff ? '#3B82F6FF' : ''
            }"
        >
          <span v-if="rolesOff" class="block w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {{ $t('roles.switch') }}
          </span>
          <span v-else class="block w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {{ chatRoles.find(item => item.id === selectedRole)?.name }}
          </span>
        </Button>
      </div>
    </DrawerTrigger>

    <DrawerContent class="bg-white dark:bg-black">
      <div id="roles-section">
        <DrawerTitle class="text-center py-4">{{ $t('roles.drawer-header') }}</DrawerTitle>

        <div class="roles__grid">
          <Role
              v-for="role in visibleRoles"
              :key="role.name"
              v-bind="role"
              :image="'/roles/' + role.icon + '.png'"
              :selected="selectedRole === role.id"
              :locked="isRoleLocked(role)"
              @select="selectedRole = role.id"
          />
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import {Drawer, DrawerContent, DrawerTitle, DrawerTrigger} from "~/components/ui/drawer";
import Role from "~/components/molecules/Role.vue";
import {ApiController} from "~/scripts/shared/api/controller";
import {type ChatRole, FeatureType} from "~/scripts/shared/types/common";
const $api = new ApiController();
const $settings = useSettings();

const isDrawerOpened = ref<boolean>(false);
watch(isDrawerOpened, value => {
  useEnv().rolesSectionOpened.value = value;
}, {immediate: true})

const selectedRole = computed({
  get() {
    return useSettings().getCurrentRole()
  },
  set: async (value: number | null) => {
    useSettings().setCurrentRole(value);
    await $api.changeChatRole(value);
  }
});

const areRolesAvailable = computed(() => $settings.hasFeature(FeatureType.roles));

const chatRoles = computed<ChatRole[]>(() => useSettings().getConfig()?.roles ?? []
)
const visibleRoles = ref<ChatRole[]>([...chatRoles.value]); // ✅ будет менять только при открытии дровера


const rolesOff = computed(() => {
  return !selectedRole.value || chatRoles.value.find(item => item.id === selectedRole.value)?.icon === 'default';
});

const isRoleLocked = (role: ChatRole) => {
  // If roles feature is not available, only default role is unlocked
  if (!areRolesAvailable.value) {
    return role.icon !== 'default';
  }
  // @ts-ignore
  return !$settings.hasFeature(`role#${role.icon}`);
};

watch(isDrawerOpened, value => {
  if (!value) return;

  const selected = chatRoles.value.find(item => item.id === selectedRole.value);
  const defaultRole = chatRoles.value.find(item => item.icon === "default");

  const unlocked = chatRoles.value.filter(r => !isRoleLocked(r) && r !== selected && r !== defaultRole);
  const locked = chatRoles.value.filter(r => isRoleLocked(r) && r !== selected && r !== defaultRole);

  let result: ChatRole[] = [];
  if (selected) result.push(selected);
  if (defaultRole && defaultRole !== selected) result.push(defaultRole);

  visibleRoles.value = [...result, ...unlocked, ...locked];
});
</script>

<style scoped>
.roles__grid {
  @apply p-10 gap-10 grid grid-cols-1
  md:grid-cols-2 w-full justify-items-center
  max-h-[80vh] overflow-y-auto;
}
</style>
