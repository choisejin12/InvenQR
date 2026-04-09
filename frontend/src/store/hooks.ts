import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// dispatch 타입
export const useAppDispatch = () => useDispatch<AppDispatch>();

// selector 타입
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;