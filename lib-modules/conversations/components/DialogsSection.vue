<template>
  <Drawer v-model:open="isDrawerOpened">
    <DrawerTrigger>
      <Button id="dialogs-button" variant="outline" size="icon">
        <MessageSquare/>
      </Button>
    </DrawerTrigger>
    <DrawerContent class="bg-white dark:bg-black">
      <DrawerHeader>
        <DrawerTitle>{{ $t('conversations') }}</DrawerTitle>
        <DrawerDescription class="w-full overflow-hidden">

          <div v-show="conversationsStore.loading" class="py-8">
            <Loader type="dialogs"/>
          </div>

          <DialogsContentBlock
              v-show="!conversationsStore.loading"
              :groups="conversationsStore.groups"
          />

        </DrawerDescription>
      </DrawerHeader>

      <DrawerFooter>
        <DrawerClose>
          <Button variant="outline">
            {{ $t('close') }}
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader, DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer';
import {MessageSquare} from 'lucide-vue-next';
import Loader from '~/components/atoms/Loader.vue';
import {watch, onBeforeMount, ref} from 'vue';
import {Button} from "~/components/ui/button";
import {useConversationsStore} from "~/stores/conversations";
import {useProjectsStore} from "~/lib-modules/projects";
import {DialogsContentBlock} from "~/lib-modules/conversations";

const conversationsStore = useConversationsStore();
const route = useRoute();
const isDrawerOpened = ref<boolean>(false);

// Close drawer on route change
watch(() => route.fullPath, () => {
  isDrawerOpened.value = false;
});

watch(isDrawerOpened, value => {
  if (!value) {
    useProjectsStore().fetchProjects();
  }
}, {
  immediate: true
})

onBeforeMount(() => {
  conversationsStore.init();
});
</script>

<style scoped></style>
