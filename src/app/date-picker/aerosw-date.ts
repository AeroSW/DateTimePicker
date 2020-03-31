export enum DateState{
    CURRENT = 0,
    OOB = 1 // Out of Bounds
};
export interface ASWDate{
    state: DateState;
    date: number;
}
