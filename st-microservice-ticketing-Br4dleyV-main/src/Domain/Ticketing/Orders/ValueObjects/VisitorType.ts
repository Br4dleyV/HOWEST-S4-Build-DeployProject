export const VisitorTypes = {
    Standard: 'standard',
    Discounted: 'discounted',
} as const;

export type VisitorType = (typeof VisitorTypes)[keyof typeof VisitorTypes];

export function isVisitorType(value: unknown): value is VisitorType {
    return value === VisitorTypes.Standard || value === VisitorTypes.Discounted;
}
