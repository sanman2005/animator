import * as React from 'react';
import { v4 as uuid } from 'uuid';
import * as GIFEncoder from 'gifencoder';

import { Category } from 'components/Category';
import { EffectForm } from 'components/EffectForm';
import { Element } from 'components/Element';
import { Content } from 'components/Grid';
import { Screen, ScreenCanvas } from 'components/Screen';
import { SpeechForm } from 'components/SpeechForm';
import { Timeline } from 'components/Timeline';
import { Text } from 'components/Text';
import { IToolboxItem, Toolbox } from 'components/Toolbox';
import { IUploadFormProps, UploadForm } from 'components/UploadForm';

import * as fileUploader from 'js/fileLoader';

import {
  getEncoder,
  interpolateElementsStates,
  loadTemplates,
  SPEECH_CATEGORY,
  TCategories,
  TTemplates,
} from './EditorHelpers';

import { ISceneElement, IVector, TFrame } from 'types';
import { ECorners } from 'js/constants';

const ANIMATION_SECONDS = 5;
const ANIMATION_FRAME_SECONDS = 0.2;

const EFFECTS_CATEGORY = 'effects';

const STORAGE_SCENE_KEY = 'scene';

const animationFramesCount = ANIMATION_SECONDS / ANIMATION_FRAME_SECONDS;

interface IEditorState {
  activeSceneElementId?: string;
  activeFrameIndex?: number;
  categories?: IToolboxItem[];
  frames?: TFrame[];
  isElementEditing?: boolean;
  playing?: boolean;
  recording?: boolean;
  recordResolution?: IVector;
  sceneElements?: ISceneElement[];
  screenElementsByFrames?: ISceneElement[][];
  templates?: TTemplates;
  uploading?: boolean;
  uploadingCategory?: string;
  uploadingError?: string;
}

class Editor extends React.PureComponent<{}, IEditorState> {
  state: IEditorState = {
    activeSceneElementId: null,
    activeFrameIndex: 0,
    categories: [],
    frames: [...Array(animationFramesCount)].map(() => ({})),
    isElementEditing: false,
    playing: false,
    recording: false,
    recordResolution: { x: 0, y: 0 },
    sceneElements: [],
    screenElementsByFrames: [...Array(animationFramesCount)].map(() => []),
    templates: {},
    uploading: false,
  };

  playTimeoutId: NodeJS.Timeout = null;

  screen: HTMLDivElement = null;
  gifEncoder: GIFEncoder = null;

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);

    this.load();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  load = async () => {
    try {
      const { templates, categories } = await loadTemplates();
      const categoriesRendered = this.renderCategories(categories);

      this.setState(
        { categories: categoriesRendered, templates },
        this.loadScene,
      );
    } catch (e) {
      this.loadScene;
    }
  };

  renderCategories = (categories: TCategories) =>
    Object.keys(categories)
      .map(category => ({
        id: category,
        content: (
          <Category
            content={categories[category]
              .map(({ id, url }) => (
                <Element
                  image={url}
                  key={id}
                  onClick={() => this.onToolboxItemClick(id, category)}
                />
              ))
              .concat(
                <Element key='+' onClick={() => this.uploadToggle(category)}>
                  +
                </Element>,
              )}
          >
            {category}
          </Category>
        ),
      }))
      .concat([
        {
          id: SPEECH_CATEGORY,
          content: (
            <Category
              content={
                <Element
                  onClick={() =>
                    this.onToolboxItemClick(SPEECH_CATEGORY, SPEECH_CATEGORY)
                  }
                >
                  Text
                </Element>
              }
            >
              {SPEECH_CATEGORY}
            </Category>
          ),
        },
      ]);

  updateScene = (state: Partial<IEditorState>) =>
    this.setState(state, this.calculateScreenElements);

  onKeyDown = (event: KeyboardEvent) => {
    const handlers: { [key: string]: (event: KeyboardEvent) => void } = {
      KeyS: this.onSave,
      Space: this.onPlay,
    };

    if (handlers[event.code]) handlers[event.code](event);
  };

  onToolboxItemClick = (templateId: string, category: string) => {
    const { templates } = this.state;
    const template = templates[templateId];
    const id = uuid();
    const isEffect = category === EFFECTS_CATEGORY;
    const isSpeech = category === SPEECH_CATEGORY;

    const screenElement: ISceneElement = {
      animationSpeed: isEffect ? 1 : 0,
      category,
      content: null,
      id,
      height: 10,
      lastFrameIndex: 0,
      position: { x: 0, y: 0 },
      repeatX: 1,
      repeatY: 1,
      rotation: 0,
      scale: { x: 1, y: 1 },
      speech: isSpeech
        ? {
            corner: ECorners.leftBottom,
            text: 'Текст',
            size: 10,
          }
        : null,
      templateId: template?.id,
      width: 10,
    };

    screenElement.content = this.renderElementContent(screenElement);

    this.addScreenElement(screenElement);
  };

  onEditElementStart = () => this.setState({ isElementEditing: true });
  onEditElementEnd = () => this.setState({ isElementEditing: false });

  renderElementContent = ({ category, id, speech, templateId }: ISceneElement) => (
    <Element
      image={this.state.templates[templateId]?.url}
      onClick={() => this.onScreenElementClick(id)}
      onClickRight={() => this.onScreenElementRightClick(id)}
      onEdit={
        [EFFECTS_CATEGORY, SPEECH_CATEGORY].includes(category) &&
        this.onEditElementStart
      }
    >
      {speech && <Text {...speech} />}
    </Element>
  );

  onScreenElementClick = (id: string) =>
    this.setState({ activeSceneElementId: id });

  onScreenElementRightClick = (id: string) => this.removeElementFromScene(id);

  removeElementFromScene = (id: string) => {
    const { frames, sceneElements } = this.state;
    const index = sceneElements.findIndex(item => item.id === id);
    const newSceneElements = sceneElements
      .slice(0, index)
      .concat(sceneElements.slice(index + 1));
    const newFrames = [...frames];

    newFrames.forEach((frame, index) => {
      newFrames[index] = { ...frames[index] };
      delete newFrames[index][id];
    });

    this.updateScene({
      frames: newFrames,
      sceneElements: newSceneElements,
    });
  };

  addScreenElement = (element: ISceneElement) => {
    const { activeFrameIndex, sceneElements } = this.state;

    this.setState({ sceneElements: [...sceneElements, element] }, () =>
      this.addElementToFrame(element.id, activeFrameIndex),
    );
  };

  updateScreenElement = (element: ISceneElement) => {
    const { activeFrameIndex, frames } = this.state;
    const { id } = element;
    const newFrames = [...frames];

    newFrames[activeFrameIndex] = {
      ...frames[activeFrameIndex],
      [id]: element,
    };

    this.updateScene({
      activeSceneElementId: id,
      frames: newFrames,
    });
  };

  updateActiveElement = (props: Partial<ISceneElement>) => {
    const { activeSceneElementId, frames, sceneElements } = this.state;
    const newSceneElements = [...sceneElements];
    const index = sceneElements.findIndex(
      item => item.id === activeSceneElementId,
    );

    if (index < 0) return;

    newSceneElements[index] = {
      ...newSceneElements[index],
      ...props,
    };

    newSceneElements[index].content = this.renderElementContent(
      newSceneElements[index],
    );

    const newProps = {
      ...props,
      content: newSceneElements[index].content,
    };

    const newFrames: TFrame[] = frames.map(frame => ({
      ...frame,
      ...(frame[activeSceneElementId] && {
        [activeSceneElementId]: {
          ...frame[activeSceneElementId],
          ...newProps,
        },
      }),
    }));

    this.updateScene({ frames: newFrames, sceneElements: newSceneElements });
    this.onEditElementEnd();
  };

  deactivateScreenElement = () => this.setState({ activeSceneElementId: null });

  onFrameSelect = (index: number) => this.setState({ activeFrameIndex: index });

  onFrameDoubleClick = (frameIndex: number) => {
    const { activeSceneElementId, frames } = this.state;

    if (!activeSceneElementId) return;

    if (frames[frameIndex][activeSceneElementId]) {
      this.removeElementFromFrame(activeSceneElementId, frameIndex);
    } else {
      this.addElementToFrame(activeSceneElementId, frameIndex);
    }
  };

  onFrameRightClick = (frameIndex: number) => {
    const { activeSceneElementId, frames, sceneElements } = this.state;

    if (!activeSceneElementId) return;

    const elementFirstFrame = frames.findIndex(
      frame => frame[activeSceneElementId],
    );

    if (elementFirstFrame >= frameIndex) return;

    const elementIndex = sceneElements.findIndex(
      ({ id }) => id === activeSceneElementId,
    );
    const { lastFrameIndex } = sceneElements[elementIndex];
    const newSceneElements = [...sceneElements];

    newSceneElements[elementIndex] = {
      ...sceneElements[elementIndex],
      lastFrameIndex: lastFrameIndex === frameIndex ? 0 : frameIndex,
    };

    this.updateScene({ sceneElements: newSceneElements });
  };

  addElementToFrame = (id: string, frameIndex: number) => {
    const { frames, sceneElements, screenElementsByFrames } = this.state;
    const activeFrame = screenElementsByFrames[frameIndex];
    const byId = (element: ISceneElement) => element.id === id;
    const element = { ...(activeFrame.find(byId) || sceneElements.find(byId)) };
    const newFrames = [...frames];

    newFrames[frameIndex] = { ...newFrames[frameIndex], [id]: element };

    this.updateScene({ frames: newFrames });
  };

  removeElementFromFrame = (id: string, frameIndex: number) => {
    const { frames } = this.state;
    const newFrames = [...frames];

    newFrames[frameIndex] = { ...frames[frameIndex] };

    delete newFrames[frameIndex][id];

    this.updateScene({ frames: newFrames });
  };

  changeElementSortIndex = (id: string, index: number) => {
    const { sceneElements } = this.state;
    const currentIndex = sceneElements.findIndex(el => el.id === id);
    const newSceneElements = [...sceneElements];

    newSceneElements[index] = sceneElements[currentIndex];
    newSceneElements[currentIndex] = sceneElements[index];

    this.updateScene({ sceneElements: newSceneElements });
  };

  calculateScreenElements = () => {
    const { frames, sceneElements, templates } = this.state;
    const screenElementsByFrames = interpolateElementsStates(
      sceneElements,
      frames,
      templates,
    );

    this.setState({ screenElementsByFrames });
  };

  onPlay = () => {
    const { frames, playing, recording } = this.state;

    if (playing) {
      clearInterval(this.playTimeoutId);
    } else {
      this.playTimeoutId = setTimeout(
        async () => {
          const { activeFrameIndex } = this.state;
          const isLastFrame = activeFrameIndex >= frames.length - 1;
          const nextIndex = isLastFrame ? 0 : activeFrameIndex + 1;

          if (recording) {
            if (isLastFrame) {
              this.setState({ playing: false, recording: false });
              this.saveRecord();

              return;
            }
          }

          this.setState(
            { activeFrameIndex: nextIndex, playing: false },
            this.onPlay,
          );
        },
        recording ? 0 : ANIMATION_FRAME_SECONDS * 1000,
      ) as NodeJS.Timeout;
    }

    this.setState({ playing: !playing });
  };

  onSave = (event: KeyboardEvent) => {
    const { frames, sceneElements } = this.state;

    if (!event.ctrlKey) return;

    event.preventDefault();

    const data = { frames, sceneElements };

    localStorage.setItem(STORAGE_SCENE_KEY, JSON.stringify(data));
  };

  loadScene = () => {
    const data = localStorage.getItem(STORAGE_SCENE_KEY);

    if (!data) return;

    const { frames, sceneElements } = JSON.parse(data) as IEditorState;

    sceneElements.forEach(element => {
      const { id } = element;

      element.content = this.renderElementContent(element);

      frames.forEach(
        frame => frame[id] && (frame[id].content = element.content),
      );
    });

    this.updateScene({ frames, sceneElements });
  };

  setScreen = (node: HTMLDivElement) => {
    const { height, width } = node.getBoundingClientRect();

    this.setState({ recordResolution: { x: width, y: height } });
    this.screen = node;
  };

  setScreenshot = (context: CanvasRenderingContext2D) =>
    this.gifEncoder.addFrame(context);

  onRecord = async () => {
    const { recordResolution } = this.state;

    this.gifEncoder = await getEncoder(
      recordResolution,
      ANIMATION_FRAME_SECONDS,
    );
    this.setState({ activeFrameIndex: 0, recording: true }, this.onPlay);
  };

  saveRecord = () => this.gifEncoder.finish();

  uploadToggle = (category?: string) =>
    this.setState(({ uploading }) => ({
      uploading: !uploading,
      uploadingCategory: category,
    }));

  uploadFile: IUploadFormProps['onLoad'] = async (content, category, file) => {
    try {
      await fileUploader.uploadFile(
        category,
        content,
        URL.createObjectURL(file),
      );

      this.uploadToggle();
      this.setState({ uploadingError: '' });
    } catch (error) {
      this.setState({
        uploadingError: error?.message || error || 'Ошибка загрузки файла',
      });
    }
  };

  render() {
    const {
      activeSceneElementId,
      activeFrameIndex,
      categories,
      frames,
      isElementEditing,
      playing,
      recording,
      recordResolution,
      sceneElements,
      screenElementsByFrames,
      uploading,
      uploadingCategory,
      uploadingError,
    } = this.state;

    const activeElement = sceneElements.find(
      ({ id }) => id === activeSceneElementId,
    );
    const editingElement =
      activeSceneElementId && isElementEditing && activeElement;

    return (
      <Content className='home' centerContent>
        <Screen
          activeElementId={activeSceneElementId}
          animationTime={playing ? ANIMATION_FRAME_SECONDS : 0}
          elements={screenElementsByFrames[activeFrameIndex]}
          getRef={this.setScreen}
          onChangeElement={this.updateScreenElement}
          onScreenClick={this.deactivateScreenElement}
        >
          {recording && (
            <ScreenCanvas
              elements={screenElementsByFrames[activeFrameIndex]}
              onDraw={this.setScreenshot}
              resolution={recordResolution}
            />
          )}
        </Screen>

        <Toolbox items={categories} position='left' />

        <Toolbox
          activeItemId={activeSceneElementId}
          items={sceneElements}
          onChangeItemIndex={this.changeElementSortIndex}
          position='right'
          withScroll
        />

        <Toolbox position='bottom'>
          <Timeline
            activeElement={activeElement}
            activeFrameIndex={activeFrameIndex}
            frames={frames}
            onFrameDoubleClick={this.onFrameDoubleClick}
            onFrameClick={this.onFrameSelect}
            onFrameRightClick={this.onFrameRightClick}
            onPlay={this.onPlay}
            onRecord={this.onRecord}
            seconds={ANIMATION_SECONDS}
          />
        </Toolbox>

        {editingElement && (
          <>
            {editingElement.category === EFFECTS_CATEGORY && (
              <EffectForm
                animationSpeed={editingElement.animationSpeed}
                onClose={this.onEditElementEnd}
                onSubmit={this.updateActiveElement}
                repeatX={editingElement.repeatX}
                repeatY={editingElement.repeatY}
              />
            )}

            {editingElement.category === SPEECH_CATEGORY && (
              <SpeechForm
                {...editingElement.speech}
                onClose={this.onEditElementEnd}
                onSubmit={this.updateActiveElement}
              />
            )}
          </>
        )}

        {uploading && (
          <UploadForm
            category={uploadingCategory}
            error={uploadingError}
            onClose={this.uploadToggle}
            onLoad={this.uploadFile}
          />
        )}
      </Content>
    );
  }
}

export default Editor;
