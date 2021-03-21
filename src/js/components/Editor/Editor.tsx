import * as React from 'react';
import { v4 as uuid } from 'uuid';
import * as GIFEncoder from 'gifencoder';

import { Category } from 'components/Category';
import { EffectForm } from 'components/EffectForm';
import { Element } from 'components/Element';
import { Content } from 'components/Grid';
import { Screen, ScreenCanvas } from 'components/Screen';
import { SpeechForm } from 'components/SpeechForm';
import { TFrame, Timeline } from 'components/Timeline';
import { Toolbox } from 'components/Toolbox';

import Elements from 'js/elements';

import { interpolateElementsStates } from './EditorHelpers';

import { ISceneElement, IVector } from 'js/types';

const ANIMATION_SECONDS = 5;
const ANIMATION_FRAME_SECONDS = 0.2;

const EFFECTS_CATEGORY = 'effects';
const SPEECH_CATEGORY = 'speech';

const STORAGE_SCENE_KEY = 'scene';

const animationFramesCount = ANIMATION_SECONDS / ANIMATION_FRAME_SECONDS;

interface IEditorState {
  activeSceneElementId?: string;
  activeFrameIndex?: number;
  frames?: TFrame[];
  isElementEditing?: boolean;
  playing?: boolean;
  recording?: boolean;
  recordResolution?: IVector;
  sceneElements?: ISceneElement[];
  screenElementsByFrames?: ISceneElement[][];
}

class Editor extends React.PureComponent<{}, IEditorState> {
  state: IEditorState = {
    activeSceneElementId: null,
    activeFrameIndex: 0,
    frames: [...Array(animationFramesCount)].map(() => ({})),
    isElementEditing: false,
    playing: false,
    recording: false,
    recordResolution: { x: 0, y: 0 },
    sceneElements: [],
    screenElementsByFrames: [...Array(animationFramesCount)].map(() => []),
  };

  playTimeoutId: NodeJS.Timeout = null;

  screen: HTMLDivElement = null;
  gifEncoder: GIFEncoder = null;

  templatesByCategory = Object.keys(Elements)
    .map(category => ({
      id: category,
      content: (
        <Category
          content={Elements[category].map((id: string) => (
            <Element
              image={id}
              key={id}
              onClick={() => this.onToolboxItemClick(id, category)}
            />
          ))}
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

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);

    this.onLoad();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  updateScene = (state: Partial<IEditorState>) =>
    this.setState(state, this.calculateScreenElements);

  onKeyDown = (event: KeyboardEvent) => {
    const handlers: { [key: string]: (event: KeyboardEvent) => void } = {
      KeyS: this.onSave,
      Space: this.onPlay,
    };

    if (handlers[event.code]) handlers[event.code](event);
  };

  onToolboxItemClick = (image: string, category: string) => {
    const id = uuid();
    const isEffect = category === EFFECTS_CATEGORY;
    const isSpeech = category === SPEECH_CATEGORY;

    const screenElement: ISceneElement = {
      animationSpeed: isEffect ? 1 : 0,
      category,
      content: null,
      id,
      image,
      height: 10,
      width: 10,
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      repeatX: 1,
      repeatY: 1,
      rotation: 0,
      text: isSpeech ? 'Текст' : '',
    };

    screenElement.content = this.renderElementContent(screenElement);

    this.addScreenElement(screenElement);
  };

  onEditElementStart = () => this.setState({ isElementEditing: true });
  onEditElementEnd = () => this.setState({ isElementEditing: false });

  renderElementContent = ({ category, id, image, text }: ISceneElement) => (
    <Element
      image={image}
      onClick={() => this.onScreenElementClick(id)}
      onClickRight={() => this.onScreenElementRightClick(id)}
      onEdit={
        [EFFECTS_CATEGORY, SPEECH_CATEGORY].includes(category) &&
        this.onEditElementStart
      }
    >
      {text && <div>{text}</div>}
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

    const newFrames: TFrame[] = frames.map(frame => ({
      ...frame,
      ...(frame[activeSceneElementId] && {
        [activeSceneElementId]: {
          ...frame[activeSceneElementId],
          ...props,
        },
      }),
    }));

    this.updateScene({ frames: newFrames, sceneElements: newSceneElements });
    this.onEditElementEnd();
  };

  deactivateScreenElement = () => this.setState({ activeSceneElementId: null });

  onFrameClick = (index: number) => this.setState({ activeFrameIndex: index });

  onFrameRightClick = (frameIndex: number) => {
    const { activeSceneElementId, frames } = this.state;

    if (!activeSceneElementId) return;

    if (frames[frameIndex][activeSceneElementId]) {
      this.removeElementFromFrame(activeSceneElementId, frameIndex);
    } else {
      this.addElementToFrame(activeSceneElementId, frameIndex);
    }
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
    const { frames, sceneElements } = this.state;
    const screenElementsByFrames = interpolateElementsStates(
      sceneElements,
      frames,
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

  onLoad = () => {
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
    const gifEncoder = new GIFEncoder(recordResolution.x, recordResolution.y);
    // @ts-ignore
    const file = await window.showSaveFilePicker({
      types: [
        {
          description: 'Gif',
          accept: { 'image/gif': ['.gif'] },
        },
      ],
    });
    // @ts-ignore
    const stream = await file.createWritable();

    stream.on = () => {};
    stream.once = () => {};
    stream.emit = () => {};
    stream.end = () => stream.close();

    gifEncoder.createReadStream().pipe(stream);

    gifEncoder.start();
    gifEncoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    gifEncoder.setDelay(ANIMATION_FRAME_SECONDS * 1000); // frame delay in ms
    gifEncoder.setQuality(10); // image quality. 10 is default.

    this.gifEncoder = gifEncoder;
    this.setState({ activeFrameIndex: 0, recording: true }, this.onPlay);
  };

  saveRecord = () => this.gifEncoder.finish();

  render() {
    const {
      activeSceneElementId,
      activeFrameIndex,
      frames,
      isElementEditing,
      playing,
      recording,
      recordResolution,
      sceneElements,
      screenElementsByFrames,
    } = this.state;

    const editingElement =
      activeSceneElementId &&
      isElementEditing &&
      sceneElements.find(({ id }) => id === activeSceneElementId);

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

        <Toolbox items={this.templatesByCategory} position='left' />

        <Toolbox
          activeItemId={activeSceneElementId}
          items={sceneElements}
          onChangeItemIndex={this.changeElementSortIndex}
          position='right'
          withScroll
        />

        <Toolbox position='bottom'>
          <Timeline
            activeElementId={activeSceneElementId}
            activeFrameIndex={activeFrameIndex}
            frames={frames}
            onFrameClick={this.onFrameClick}
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
                onClose={this.onEditElementEnd}
                onSubmit={this.updateActiveElement}
                text={editingElement.text}
              />
            )}
          </>
        )}
      </Content>
    );
  }
}

export default Editor;
