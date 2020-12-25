在项目实战开发中，图片预览是非常常见的需求，尤其是在做后台管理系统中，我们都知道在使用`Vue`开发的项目中，`v-viewer`是一个基于`Vue`和`Viewer.js`封装的非常好用的第三方图片预览组件。其实`Viewer.js`也有基于`React`封装的版本，那就是`rc-viewer`。

但是，在实际开发中，我们可能有很多页面都需要使用到图片预览功能，作为一个有追求的程序猿，当然无法接收相同的事情重复干。基于组件化的开发思想，今天我们将基于`react`和`rc-viewer`二次封装一个图片预览组件。

# 一、基本使用

## 1. 安装

```bash
npm install @hanyk/rc-viewer
```

## 2. 简单使用

```javascript
import React, { useState } from "react";
import { Button } from "antd";
import RcViewer from "@hanyk/rc-viewer";
function Preview() {
  const [preview, setPreview] = useState(null);
  const [previewImgUrl, setPreviewImgUrl] = useState("");
  function handlePreview() {
    setPreviewImgUrl(
      "http://xxxx.oss-cn-shenzhen.aliyuncs.com/jies/settlement/2020-12-24/420325196902011112%E5%9B%BD%E5%BE%BD%E9%9D%A2%20-%20%E5%89%AF%E6%9C%AC%20(4)-20201224180454.jpg"
    );
    if (preview) {
      preview.viewer.show();
    }
  }
  const options = {
    // 是否显示下面工具栏 1 显示 0 隐藏
    toolbar: 1,
    // 关闭时的回调
    hide() {
      console.log("hide");
    },
  };
  return (
    <div>
      <Button type="primary" onClick={handlePreview}>
        预览
      </Button>
      <div style={{ display: "none" }}>
        <RcViewer
          options={options}
          ref={(v) => {
            setPreview(v);
          }}
        >
          <ul id="images">
            <li>
              <img src={previewImgUrl} alt="" />
            </li>
          </ul>
        </RcViewer>
      </div>
    </div>
  );
}
export default Preview;
```

# 二、使用 Redux 进行封装

```javascript
|- src
    |- components
        |- Preview
            |- index.tsx
            import React, { useEffect, useState } from 'react';
            import RcViewer from '@hanyk/rc-viewer';
            import { useSelector } from 'react-redux';
            import store from '@/store/index';
            import { tooglePreview } from '@/store/modules/common/actionCreators';
            function Preview() {
                const [preview, setPreview] = useState(null);
                const isVisible = useSelector((state: any) => {
                    return state.getIn(['common', 'isPreviewVisible']);
                });
                // 要预览的图片
                const previewImgUrl = useSelector((state: any) => {
                    return state.getIn(['common', 'previewImgUrl']);
                });
                // 展示
                function show() {
                    if (preview) {
                        (preview as any).viewer.show();
                    }
                }
                useEffect(() => {
                    isVisible && show();
                }, [isVisible]);

                const options = {
                    // 是否显示下面工具栏 1 显示 0 隐藏
                    toolbar: 1,
                    // 关闭时的回调
                    hide() {
                        store.dispatch(tooglePreview(false));
                    },
                };
                return (
                    <div style={{ display: 'none' }}>
                        <RcViewer
                            options={options}
                            ref={(v: any) => {
                                setPreview(v);
                            }}
                        >
                            <ul id="images">
                                <li>
                                    <img src={previewImgUrl} />
                                </li>
                            </ul>
                        </RcViewer>
                    </div>
                );
            }
            export default Preview;
    |- store
        |- modules
            |- common
                |- actionCreators.ts
                import * as actionTypes from './actionTypes';
                export const tooglePreview = (payload: boolean) => ({
                    type: actionTypes.SET_PREVIEW_TOOGLE,
                    data: payload,
                });
                export const setPreviewUrl = (payload: string) => ({
                    type: actionTypes.SET_PREVIEW_URL,
                    data: payload,
                });

                |- actionTypes.ts
                // 切换预览显示隐藏
                export const SET_PREVIEW_TOOGLE = 'common/SET_PREVIEW_TOOGLE';
                // 设置预览图片地址
                export const SET_PREVIEW_URL = 'common/SET_PREVIEW_URL';

                |- index.ts
                import reducers from './reducers';
                import * as actionCreators from './actionCreators';
                import * as actionTypes from './actionTypes';
                export { reducers, actionCreators, actionTypes };

                |- reducers.ts
                import * as actionTypes from './actionTypes';
                import { fromJS } from 'immutable';
                const defaultState = fromJS({
                    // 是否显示预览
                    isPreviewVisible: false,
                    // 预览的图片地址
                    previewImgUrl: '',
                });
                export default (state = defaultState, action: any) => {
                    switch (action.type) {
                        case actionTypes.SET_PREVIEW_TOOGLE:
                            return state.set('isPreviewVisible', action.data);
                        case actionTypes.SET_PREVIEW_URL:
                            return state.set('previewImgUrl', action.data);
                        default:
                            break;
                    }
                    return state;
                };

            |- index.ts
            import { createStore, applyMiddleware, compose } from 'redux';
            import createSagaMiddleware from 'redux-saga';
            import reducer from './reducers';
            // 引入合并后的saga
            import rootSaga from './sagas';
            const sagaMiddleware = createSagaMiddleware();
            const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
                ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
                : compose;
            const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware));
            const store = createStore(reducer, enhancer);
            // 执行saga
            sagaMiddleware.run(rootSaga);
            export default store;

            |- reducers.ts
            import { combineReducers } from 'redux-immutable';
            import { reducers as commonReducer } from './modules/common/index';
            import { reducers as businessReducer } from './modules/business/index';
            const reducer = combineReducers({
                common: commonReducer
            });
            export default reducer;

            |- sagas.ts
            import { all, fork } from 'redux-saga/effects';
            // 异步逻辑模块文件引入
            import { businessSagas } from './modules/business';
            // 合并saga，单一进入点，一次启动所有Saga
            export default function* rootSaga() {
                yield all([fork(businessSagas.default)]);
            }
    |- view
    App.tsx
    import React, { useEffect } from 'react';
    import store from '@/store/index';
    import { tooglePreview, setPreviewUrl } from '@/store/modules/common/actionCreators';
    import Preview from '@components/Preview/index';
    import { Button } from 'antd'
    function App() {
        function handlePreview(file) {
            store.dispatch(tooglePreview(true));
            store.dispatch(setPreviewUrl(file.url));
        }
        return (
            <div>
                <Button onClick={handlePreview}>预览</Button>
                <Preview />
            </div>
        );
    }
    export default App;
```
