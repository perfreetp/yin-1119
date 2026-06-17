import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useChildStore } from '@/store/useChildStore';
import './app.scss';

function App(props) {
  const loadFromStorage = useChildStore(state => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, []);

  useDidShow(() => {});

  useDidHide(() => {});

  return props.children;
}

export default App;
