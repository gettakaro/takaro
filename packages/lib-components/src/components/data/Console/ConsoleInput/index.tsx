import { createRef, Dispatch, FC, KeyboardEvent, SetStateAction, useState, Ref, useEffect, ChangeEvent } from 'react';
import SimpleBar from 'simplebar-react';
import { Message } from '../ConsoleInterface';
import { Container, StyledEnterIcon, SuggestionsContainer } from './style';
import { useSnackbar } from 'notistack';

export interface Suggestion {
  command: string;
  description?: string;
}

export interface ConsoleInputProps {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onExecuteCommand: (command: string) => Promise<Message>;
  suggestions: Suggestion[];
}

export const ConsoleInput: FC<ConsoleInputProps> = ({ onExecuteCommand, setMessages, suggestions }) => {
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = createRef<HTMLInputElement>();
  const selectedSuggestionRef = createRef<HTMLLIElement>();
  const scrollableNodeRef: Ref<HTMLDivElement> = createRef();
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [input, setInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(suggestions);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0);

  async function executeCommand() {
    if (input != '') {
      try {
        const message = await onExecuteCommand(input);
        setMessages((prev: Message[]) => [...prev, message]);
      } catch {
        enqueueSnackbar('Something went wrong while executing your command.', { variant: 'error' });
      }
    }
  }

  /// Takes a suggestion from the suggestion list and fills it in the input field.
  const fillSuggestion = (selectedSuggestionIndex: number) => {
    setInput(filteredSuggestions[selectedSuggestionIndex].command);
    hideSuggestion();
  };

  const hideSuggestion = () => {
    setShowSuggestions(false);
    setSelectedSuggestion(0);
  };

  useEffect(() => {
    /// scroll selected item into the view.
    selectedSuggestionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }, [selectedSuggestion, filteredSuggestions]);

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (showSuggestions) {
        fillSuggestion(selectedSuggestion);
      } else {
        executeCommand();
        hideSuggestion();
      }
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowDown') {
      const newSuggestion = selectedSuggestion + 1;
      if (newSuggestion < suggestions.length) {
        setSelectedSuggestion(newSuggestion);
      } else {
        setSelectedSuggestion(0);
      }
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowUp') {
      const newSuggestion = selectedSuggestion - 1;
      if (newSuggestion >= 0) {
        setSelectedSuggestion(newSuggestion);
      } else {
        setSelectedSuggestion(filteredSuggestions.length - 1);
      }
      e.preventDefault();
      return;
    }
    if (e.key === 'Escape') {
      if (scrollableNodeRef && scrollableNodeRef.current)
        scrollableNodeRef.current.scrollTop = 0;
      hideSuggestion();
    }

    if (e.key === 'Tab') {
      if (showSuggestions) {
        fillSuggestion(selectedSuggestion);
        inputRef.current?.focus();
      }
      e.preventDefault();
      return;
    }
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setFilteredSuggestions(suggestions.filter(suggestion => suggestion.command.includes(input.toLowerCase())));
  };

  useEffect(() => {
    if (input === '') {
      setFilteredSuggestions(suggestions);
      hideSuggestion();
    } else {
      setShowSuggestions(true);
    }
  }, [input]);

  const renderSuggestions = () => {
    if (showSuggestions) {

      // lets limit the suggestions to 20.
      if (filteredSuggestions.length) {
        return filteredSuggestions.map((suggestion, index) => (
          <li
            className={index === selectedSuggestion ? 'active' : ''}
            ref={index === selectedSuggestion ? selectedSuggestionRef : null}
            onClick={() => { fillSuggestion(index); }}
          /* onMouseEnter={() => { setSelectedSuggestion(index); }} */
          >
            <span>{suggestion.command}</span><span>{suggestion.description}</span>
          </li>
        ));
      } else {
        return <div>Not found</div>;
      }
    }
    return <></>;
  };

  return (
    <Container>
      <SuggestionsContainer showSuggestions={showSuggestions}>
        <h3>Command suggestions</h3>
        <SimpleBar
          style={{ maxHeight: '50vh', minHeight: '50vh', overflowX: 'hidden' }}
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          <ul>
            {renderSuggestions()}
          </ul>
        </SimpleBar>
      </SuggestionsContainer>
      <input
        placeholder="Type here to execute a command.."
        onKeyDown={handleOnKeyDown}
        onChange={handleOnChange}
        value={input}
        ref={inputRef}
      />
      <StyledEnterIcon fill="white" onClick={executeCommand} />
    </Container>
  );
};

