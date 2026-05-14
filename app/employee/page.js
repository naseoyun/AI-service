'use client';
import { useEffect } from 'react';

export default function EmployeePage() {
  useEffect(() => {
    window.location.href = '/employee_frontend/employee.html';
  }, []);

  return null;
}