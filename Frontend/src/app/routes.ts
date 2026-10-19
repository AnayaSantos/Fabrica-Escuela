export const MODULE_IDS = [
  'hu-01',
  'hu-02',
  'hu-03',
  'hu-04',
  'hu-05',
  'hu-07',
  'hu-13',
  'hu-14',
  'hu-15',
  'hu-19',
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export function getModuleId(hash: string): ModuleId {
  const moduleId = hash.replace(/^#\/?/, '').split(/[/?]/, 1)[0];
  return MODULE_IDS.find((candidate) => candidate === moduleId) ?? 'hu-02';
}
