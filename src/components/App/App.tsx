import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { PacmanLoader } from 'react-spinners';
import { Toaster, toast } from 'react-hot-toast';
import { keepPreviousData } from '@tanstack/react-query';

import { fetchNotes, type NoteResponse } from '../../services/noteService';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import SearchBox from '../SearchBox/SearchBox';

import css from './App.module.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 1000);

  const notesQuery = useQuery<NoteResponse>({
    queryKey: ['notes', currentPage, searchTerm],
    queryFn: () => fetchNotes(currentPage, searchTerm),
    placeholderData: keepPreviousData,
  });

  const { data, isLoading, isError, isSuccess } = notesQuery;

  const totalPages = data?.totalPages ?? 0;

  if (isError) {
    toast.error('Something went wrong');
  }

  if (isSuccess && data?.notes.length === 0) {
    toast.error('Notes not found.');
  }

  const showModal = () => setModalOpen(true);
  const hideModal = () => setModalOpen(false);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onSearch={debouncedSearch} />

        {data && data.totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

        <button onClick={showModal} className={css.button}>
          Create note +
        </button>
      </header>

      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
        >
          <PacmanLoader speedMultiplier={2} color="#c4c700ff" size={30} />
        </div>
      )}

      {modalOpen && (
        <Modal closeModal={hideModal}>
          <NoteForm closeModal={hideModal} />
        </Modal>
      )}

      {data && data.notes.length > 0 && <NoteList data={data.notes} />}

      <Toaster />
    </div>
  );
}
