'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import styles from './todos.module.css';

type Priority = 'low' | 'medium' | 'high';
type Filter = 'all' | 'today' | 'active' | 'completed';
type Todo = { id: string; text: string; completed: boolean; createdAt: number; dueDate: string; priority: Priority };

const STORAGE_KEY = 'taskflow.todos.v2';
const categories = ['Wszystkie', 'Praca', 'Osobiste', 'Zakupy'];
const priorityLabels: Record<Priority, string> = { low: 'Niski', medium: 'Średni', high: 'Wysoki' };

function isToday(value: string) {
  return value === new Date().toISOString().slice(0, 10);
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState('Wszystkie');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'priority' | 'date'>('newest');
  const [editing, setEditing] = useState<Todo | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTodos(JSON.parse(saved));
    } catch { /* Ignore malformed browser data. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, ready]);

  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter((todo) => !todo.completed).length,
    completed: todos.filter((todo) => todo.completed).length,
    today: todos.filter((todo) => !todo.completed && isToday(todo.dueDate)).length,
  }), [todos]);

  const visibleTodos = useMemo(() => {
    const result = todos.filter((todo) => {
      const matchesSearch = todo.text.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || (filter === 'active' && !todo.completed) || (filter === 'completed' && todo.completed) || (filter === 'today' && isToday(todo.dueDate));
      return matchesSearch && matchesFilter && (category === 'Wszystkie' || category === 'Osobiste');
    });
    return result.sort((a, b) => sort === 'priority' ? ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]) : sort === 'date' ? (a.dueDate || '9999').localeCompare(b.dueDate || '9999') : b.createdAt - a.createdAt);
  }, [todos, search, filter, category, sort]);

  const addTodo = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    setTodos((current) => [{ id: crypto.randomUUID(), text: text.trim(), completed: false, createdAt: Date.now(), dueDate, priority }, ...current]);
    setText(''); setDueDate(''); setPriority('medium');
    setNotice('Zadanie dodane');
    setTimeout(() => setNotice(''), 1800);
  };

  const toggleTodo = (id: string) => setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  const removeTodo = (id: string) => setTodos((current) => current.filter((todo) => todo.id !== id));
  const clearCompleted = () => setTodos((current) => current.filter((todo) => !todo.completed));
  const saveEdit = (event: FormEvent) => {
    event.preventDefault();
    if (!editing?.text.trim()) return;
    setTodos((current) => current.map((todo) => todo.id === editing.id ? editing : todo));
    setEditing(null);
  };

  if (!ready) return <main className={styles.loading}><span />Ładowanie Twoich zadań…</main>;

  return (
    <main className={styles.shell}>
      <div className={styles.glow} />
      <header className={styles.header}>
        <a className={styles.brand} href="/todos"><span className={styles.logo}>✓</span><span><b>Taskflow</b><small>personal workspace</small></span></a>
        <div className={styles.headerActions}><span className={styles.saved}><i /> Zapisane lokalnie</span><button className={styles.avatar}>RK</button></div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.greeting}><span className={styles.avatarLarge}>RK</span><div><small>Witaj z powrotem,</small><strong>Remik 👋</strong></div></div>
          <button className={styles.newButton} onClick={() => document.getElementById('new-task')?.focus()}><span>＋</span> Nowe zadanie <kbd>⌘ K</kbd></button>
          <nav className={styles.nav}>
            <p>WORKSPACE</p>
            <button className={filter === 'all' ? styles.navActive : ''} onClick={() => setFilter('all')}><span>▦</span> Wszystkie <em>{stats.total}</em></button>
            <button className={filter === 'today' ? styles.navActive : ''} onClick={() => setFilter('today')}><span>◷</span> Na dziś <em>{stats.today}</em></button>
            <button className={filter === 'active' ? styles.navActive : ''} onClick={() => setFilter('active')}><span>○</span> Aktywne <em>{stats.active}</em></button>
            <button className={filter === 'completed' ? styles.navActive : ''} onClick={() => setFilter('completed')}><span>✓</span> Ukończone <em>{stats.completed}</em></button>
            <p className={styles.categoryTitle}>LISTY</p>
            {categories.map((item) => <button key={item} className={category === item ? styles.navActive : ''} onClick={() => setCategory(item)}><span className={item === 'Praca' ? styles.dotBlue : item === 'Osobiste' ? styles.dotPurple : styles.dotYellow}>●</span> {item}</button>)}
          </nav>
          <div className={styles.sidebarBottom}><div className={styles.progressLabel}><span>Twój postęp</span><b>{stats.total ? Math.round(stats.completed / stats.total * 100) : 0}%</b></div><div className={styles.progress}><i style={{ width: `${stats.total ? stats.completed / stats.total * 100 : 0}%` }} /></div><small>Małe kroki prowadzą do wielkich celów.</small></div>
        </aside>

        <section className={styles.content}>
          <div className={styles.pageTitle}><div><p className={styles.eyebrow}>WTOREK, 29 WRZEŚNIA</p><h1>Moje zadania</h1><p className={styles.subtitle}>Zorganizuj dzień. Zrób coś wielkiego.</p></div><div className={styles.dateCard}><span>WRZ</span><b>29</b><small>2026</small></div></div>
          <div className={styles.stats}><div><span className={styles.statIcon}>◒</span><span><small>Wszystkie zadania</small><strong>{stats.total}</strong></span></div><div><span className={`${styles.statIcon} ${styles.green}`}>◷</span><span><small>W trakcie</small><strong>{stats.active}</strong></span></div><div><span className={`${styles.statIcon} ${styles.purple}`}>✓</span><span><small>Ukończone</small><strong>{stats.completed}</strong></span></div></div>

          <form className={styles.addForm} onSubmit={addTodo}><div className={styles.inputWrap}><span>＋</span><input id="new-task" value={text} onChange={(event) => setText(event.target.value)} placeholder="Dodaj nowe zadanie…" /></div><div className={styles.formOptions}><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Termin" /><select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} aria-label="Priorytet"><option value="low">Niski priorytet</option><option value="medium">Średni priorytet</option><option value="high">Wysoki priorytet</option></select><button type="submit">Dodaj zadanie <span>↵</span></button></div></form>

          <div className={styles.toolbar}><div className={styles.search}><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Szukaj zadań…" /></div><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="newest">Najnowsze</option><option value="priority">Priorytet</option><option value="date">Termin</option></select><button className={styles.more}>•••</button></div>
          <div className={styles.listHeader}><span>{filter === 'completed' ? 'UKOŃCZONE' : filter === 'today' ? 'NA DZIŚ' : 'TWOJE ZADANIA'} <b>{visibleTodos.length}</b></span>{stats.completed > 0 && <button onClick={clearCompleted}>Wyczyść ukończone</button>}</div>
          <div className={styles.list}>{visibleTodos.length === 0 ? <div className={styles.empty}><div>✓</div><h3>Wszystko czyste!</h3><p>Dodaj zadanie, aby zacząć planować swój dzień.</p></div> : visibleTodos.map((todo) => <article className={`${styles.todo} ${todo.completed ? styles.done : ''}`} key={todo.id}><button className={styles.check} onClick={() => toggleTodo(todo.id)} aria-label={todo.completed ? 'Oznacz jako aktywne' : 'Oznacz jako ukończone'}>{todo.completed ? '✓' : ''}</button><div className={styles.todoBody}><h3>{todo.text}</h3><div className={styles.meta}><span className={`${styles.priority} ${styles[todo.priority]}`}>{priorityLabels[todo.priority]}</span>{todo.dueDate && <span>◷ {new Date(`${todo.dueDate}T12:00:00`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}</span>}<span>Dodano {new Date(todo.createdAt).toLocaleDateString('pl-PL')}</span></div></div><div className={styles.todoActions}><button onClick={() => setEditing(todo)} aria-label="Edytuj">✎</button><button onClick={() => removeTodo(todo.id)} aria-label="Usuń">×</button></div></article>)}</div>
          <footer className={styles.footer}><span>Taskflow v2.0</span><span>Twoje dane pozostają na tym urządzeniu</span></footer>
        </section>
      </div>

      {notice && <div className={styles.toast}>✓ {notice}</div>}
      {editing && <div className={styles.modalBackdrop} onMouseDown={() => setEditing(null)}><form className={styles.modal} onSubmit={saveEdit} onMouseDown={(event) => event.stopPropagation()}><h2>Edytuj zadanie</h2><input autoFocus value={editing.text} onChange={(event) => setEditing({ ...editing, text: event.target.value })} /><div className={styles.modalRow}><input type="date" value={editing.dueDate} onChange={(event) => setEditing({ ...editing, dueDate: event.target.value })} /><select value={editing.priority} onChange={(event) => setEditing({ ...editing, priority: event.target.value as Priority })}><option value="low">Niski</option><option value="medium">Średni</option><option value="high">Wysoki</option></select></div><div className={styles.modalActions}><button type="button" onClick={() => setEditing(null)}>Anuluj</button><button type="submit">Zapisz zmiany</button></div></form></div>}
    </main>
  );
}
