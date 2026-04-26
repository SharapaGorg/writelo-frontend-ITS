<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import SectionHeader from './SectionHeader.vue'
import { useScrollReveal } from '../composables/useScrollReveal'

type Support = 'yes' | 'partial' | 'no'
type BrandKey = 'writelo' | 'trendsee' | 'livedune' | 'smmplanner'

interface Row {
  label: string
  support: Record<BrandKey, Support>
}

interface Group {
  title: string
  rows: Row[]
}

const { t } = useI18n()
const { elementRef, isVisible } = useScrollReveal()

const otherBrandKeys = ['trendsee', 'livedune', 'smmplanner'] as const

const otherBrands = computed(() =>
  otherBrandKeys.map(key => ({
    key,
    name: t(`landingNew.comparison.brands.${key}`),
  })),
)

const groups = computed<Group[]>(() => [
  {
    title: t('landingNew.comparison.groups.analysis'),
    rows: [
      { label: t('landingNew.comparison.rows.topReels'),     support: { writelo: 'yes', trendsee: 'yes', livedune: 'yes',     smmplanner: 'no' } },
      { label: t('landingNew.comparison.rows.aiBreakdown'),  support: { writelo: 'yes', trendsee: 'yes', livedune: 'no',      smmplanner: 'no' } },
      { label: t('landingNew.comparison.rows.diagnostics'),  support: { writelo: 'yes', trendsee: 'no',  livedune: 'no',      smmplanner: 'no' } },
    ],
  },
  {
    title: t('landingNew.comparison.groups.creation'),
    rows: [
      { label: t('landingNew.comparison.rows.scenarios'),    support: { writelo: 'yes', trendsee: 'yes', livedune: 'no',      smmplanner: 'no' } },
      { label: t('landingNew.comparison.rows.brandPosts'),   support: { writelo: 'yes', trendsee: 'no',  livedune: 'no',      smmplanner: 'yes' } },
      { label: t('landingNew.comparison.rows.brandProfile'), support: { writelo: 'yes', trendsee: 'no',  livedune: 'no',      smmplanner: 'yes' } },
      { label: t('landingNew.comparison.rows.imageGen'),     support: { writelo: 'yes', trendsee: 'no',  livedune: 'no',      smmplanner: 'yes' } },
    ],
  },
  {
    title: t('landingNew.comparison.groups.planning'),
    rows: [
      { label: t('landingNew.comparison.rows.calendar'),     support: { writelo: 'yes', trendsee: 'no',  livedune: 'partial', smmplanner: 'yes' } },
      { label: t('landingNew.comparison.rows.newsAuto'),     support: { writelo: 'yes', trendsee: 'no',  livedune: 'no',      smmplanner: 'partial' } },
      { label: t('landingNew.comparison.rows.autopost'),     support: { writelo: 'yes', trendsee: 'no',  livedune: 'yes',     smmplanner: 'yes' } },
    ],
  },
])

function isFinalFeatureRow(groupIndex: number, rowIndex: number) {
  const lastGroup = groups.value.length - 1
  const lastRow = groups.value[groupIndex].rows.length - 1
  return groupIndex === lastGroup && rowIndex === lastRow
}
</script>

<template>
  <section
    id="comparison"
    ref="elementRef"
    class="px-6 md:px-12 py-20 md:py-32 transition-all duration-700 ease-out"
    :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
  >
    <div class="max-w-[1200px] mx-auto">
      <SectionHeader :label="t('landingNew.comparison.label')">
        <template #title>
          {{ t('landingNew.comparison.titlePre') }}<br>
          <span class="italic font-medium text-[#d4683f]">{{ t('landingNew.comparison.titleAccent') }}</span>
          {{ t('landingNew.comparison.titlePost') }}
        </template>
      </SectionHeader>

      <div class="overflow-x-auto -mx-6 md:mx-0 pb-1">
        <table class="w-full min-w-[680px] mx-6 md:mx-0 border-collapse">
          <thead>
            <tr>
              <th class="sticky left-0 z-20 bg-[#0a0a0a] w-[44%] md:w-auto" />
              <th
                class="bg-[#d4683f]/[0.07] border-x border-t-[2px] border-[#d4683f] px-3 md:px-4 pt-9 pb-5 text-center align-bottom"
              >
                <div class="lnf-display font-bold text-[20px] md:text-[24px] tracking-[-0.02em] text-[#d4683f]">
                  {{ t('landingNew.comparison.brands.writelo') }}
                </div>
              </th>
              <th
                v-for="brand in otherBrands"
                :key="brand.key"
                class="px-3 md:px-4 pt-9 pb-5 text-center align-bottom"
              >
                <div class="lnf-display font-medium text-[16px] md:text-[18px] tracking-[-0.02em] text-[#a8a094]">
                  {{ brand.name }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(group, gi) in groups" :key="group.title">
              <tr>
                <th
                  scope="rowgroup"
                  class="sticky left-0 z-10 bg-[#0a0a0a] text-left lnf-mono font-normal uppercase tracking-[0.08em] md:tracking-[0.12em] text-[10px] md:text-[11px] text-[#a8a094] pt-11 md:pt-14 pb-4 pl-1 md:pl-3 align-bottom"
                >
                  <span class="text-[#5a5550] mr-2 lnf-mono">{{ String(gi + 1).padStart(2, '0') }}</span>
                  <span>{{ group.title }}</span>
                </th>
                <td class="bg-[#d4683f]/[0.07] border-x border-[#d4683f] pt-11 md:pt-14 pb-4" />
                <td class="pt-11 md:pt-14 pb-4" />
                <td class="pt-11 md:pt-14 pb-4" />
                <td class="pt-11 md:pt-14 pb-4" />
              </tr>
              <tr
                v-for="(row, ri) in group.rows"
                :key="row.label"
                class="border-t border-[#ede8de]/[0.07]"
              >
                <th
                  scope="row"
                  class="sticky left-0 z-10 bg-[#0a0a0a] text-left lnf-body font-normal text-[14px] md:text-[15px] leading-[1.4] text-[#ede8de] py-4 pr-3 pl-1 md:pl-3 align-middle"
                >
                  {{ row.label }}
                </th>
                <td
                  class="bg-[#d4683f]/[0.07] border-x border-[#d4683f] text-center py-4 px-3 align-middle"
                  :class="isFinalFeatureRow(gi, ri) && 'border-b-[2px]'"
                >
                  <Check
                    v-if="row.support.writelo === 'yes'"
                    class="w-[18px] h-[18px] text-[#d4683f] mx-auto"
                    :stroke-width="2.4"
                  />
                  <span
                    v-else-if="row.support.writelo === 'partial'"
                    class="block w-2 h-2 rounded-full bg-[#d4683f] mx-auto"
                  />
                  <span
                    v-else
                    class="block w-3.5 h-px bg-[#5a5550] mx-auto"
                  />
                </td>
                <td
                  v-for="brand in otherBrands"
                  :key="brand.key"
                  class="text-center py-4 px-3 align-middle"
                >
                  <Check
                    v-if="row.support[brand.key] === 'yes'"
                    class="w-4 h-4 text-[#d4683f] mx-auto"
                    :stroke-width="2"
                  />
                  <span
                    v-else-if="row.support[brand.key] === 'partial'"
                    class="block w-1.5 h-1.5 rounded-full bg-[#d4683f]/70 mx-auto"
                  />
                  <span
                    v-else
                    class="block w-3.5 h-px bg-[#5a5550] mx-auto"
                  />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="mt-7 md:mt-9 flex flex-wrap items-center justify-end gap-x-7 gap-y-2 lnf-mono text-[10px] uppercase tracking-[0.15em] text-[#a8a094]">
        <span class="inline-flex items-center gap-2">
          <Check class="w-3.5 h-3.5 text-[#d4683f]" :stroke-width="2.4" />
          {{ t('landingNew.comparison.legend.yes') }}
        </span>
        <span class="inline-flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#d4683f]/70" />
          {{ t('landingNew.comparison.legend.partial') }}
        </span>
        <span class="inline-flex items-center gap-2">
          <span class="w-3 h-px bg-[#5a5550]" />
          {{ t('landingNew.comparison.legend.no') }}
        </span>
      </div>
    </div>
  </section>
</template>
