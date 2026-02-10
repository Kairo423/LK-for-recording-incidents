// Централизованные моковые данные для демонстрации

export interface Incident {
  id: number;
  number: string;
  type: string;
  department: string;
  date: string;
  time?: string;
  status: 'Новое' | 'В работе' | 'Завершено';
  description: string;
  author?: string;
  responsible?: string;
  measures?: string;
}

export const mockIncidents: Incident[] = [
  {
    id: 1,
    number: 'INC-2026-001',
    type: 'Авария',
    department: 'Производство',
    date: '2026-02-08',
    time: '14:30',
    status: 'В работе',
    description: 'Произошла поломка оборудования на производственной линии №3. Остановка производства на 2 часа.',
    author: 'Иванов Иван Иванович',
    responsible: 'Петров П.П.',
    measures: 'Вызван технический специалист, проведена диагностика, заказаны запасные части.'
  },
  {
    id: 2,
    number: 'INC-2026-002',
    type: 'Несчастный случай',
    department: 'Склад',
    date: '2026-02-07',
    time: '10:15',
    status: 'Завершено',
    description: 'Травма при погрузке материалов. Работник получил ушиб руки.',
    author: 'Сидоров С.С.',
    responsible: 'Кузнецов К.К.',
    measures: 'Оказана первая помощь, работник направлен в медпункт. Проведен инструктаж.'
  },
  {
    id: 3,
    number: 'INC-2026-003',
    type: 'Технический инцидент',
    department: 'ИТ',
    date: '2026-02-06',
    time: '16:45',
    status: 'Новое',
    description: 'Отказ серверного оборудования, временная недоступность корпоративных систем.',
    author: 'Смирнов А.А.',
    responsible: 'Павлов П.П.',
    measures: 'Выполнена перезагрузка серверов, ведется диагностика.'
  },
  {
    id: 4,
    number: 'INC-2026-004',
    type: 'Пожар',
    department: 'Цех №1',
    date: '2026-02-05',
    time: '09:20',
    status: 'Завершено',
    description: 'Возгорание в электрощитовой. Пожар ликвидирован в течение 10 минут.',
    author: 'Волков В.В.',
    responsible: 'Морозов М.М.',
    measures: 'Вызвана пожарная служба, эвакуированы сотрудники, проведено расследование.'
  },
  {
    id: 5,
    number: 'INC-2026-005',
    type: 'ДТП',
    department: 'Логистика',
    date: '2026-02-04',
    time: '12:30',
    status: 'Новое',
    description: 'ДТП с участием служебного транспорта при доставке грузов.',
    author: 'Николаев Н.Н.',
    responsible: 'Федоров Ф.Ф.',
    measures: 'Вызваны ГИБДД и страховая компания, оформляется документация.'
  },
  {
    id: 6,
    number: 'INC-2026-006',
    type: 'Авария',
    department: 'Производство',
    date: '2026-02-03',
    time: '15:00',
    status: 'Завершено',
    description: 'Утечка химических веществ из резервуара №5.',
    author: 'Григорьев Г.Г.',
    responsible: 'Алексеев А.А.',
    measures: 'Проведена локализация утечки, очищена территория, заменено оборудование.'
  },
  {
    id: 7,
    number: 'INC-2026-007',
    type: 'Несчастный случай',
    department: 'Производство',
    date: '2026-02-02',
    time: '11:40',
    status: 'В работе',
    description: 'Падение работника с высоты 2 метра при проведении ремонтных работ.',
    author: 'Соколов С.С.',
    responsible: 'Новиков Н.Н.',
    measures: 'Вызвана скорая помощь, работник госпитализирован, проводится расследование.'
  },
  {
    id: 8,
    number: 'INC-2026-008',
    type: 'Технический инцидент',
    department: 'Энергетика',
    date: '2026-02-01',
    time: '08:15',
    status: 'Завершено',
    description: 'Перебои в электроснабжении производственного корпуса.',
    author: 'Козлов К.К.',
    responsible: 'Белов Б.Б.',
    measures: 'Выявлена неисправность трансформатора, проведен ремонт, питание восстановлено.'
  }
];

export const getIncidentById = (id: number): Incident | undefined => {
  return mockIncidents.find(incident => incident.id === id);
};

export const getStatusVariant = (status: string): 'in-progress' | 'completed' | 'default' => {
  if (status === 'В работе') return 'in-progress';
  if (status === 'Завершено') return 'completed';
  return 'default';
};

export const getTypeVariant = (type: string): 'critical' | 'default' => {
  if (type === 'Авария' || type === 'Пожар') return 'critical';
  return 'default';
};