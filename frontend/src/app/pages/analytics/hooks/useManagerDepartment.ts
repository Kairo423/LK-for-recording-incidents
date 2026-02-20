import { useEffect, useRef, useState } from 'react';
import apiClient from '../../../../api/client';
import { UserRole } from '../../../types';

interface DepartmentInfo {
  id: string;
  label: string;
}

export const useManagerDepartment = (
  userRole: UserRole,
  onDepartmentResolved?: (departmentId: string) => void
) => {
  const [userDepartment, setUserDepartment] = useState<DepartmentInfo | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (userRole !== 'manager') {
      setUserDepartment(null);
      setProfileError(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsProfileLoading(true);
        setProfileError(null);
        const res = await apiClient.get('/users/profile/');
        if (!isMountedRef.current) {
          return;
        }
        const data = res.data || {};
        const userData = data.user || data;
        const profile = userData.profile || data.profile || {};

        let departmentId: string | null = null;
        const profileDepartment =
          profile.department !== undefined && profile.department !== null
            ? profile.department
            : profile.department_id;

        if (profileDepartment !== undefined && profileDepartment !== null) {
          departmentId = String(profileDepartment);
        }

        const departmentLabel =
          userData.department_name ||
          profile.department_name ||
          data.department_name ||
          'Моё подразделение';

        if (departmentId) {
          const departmentInfo = { id: departmentId, label: departmentLabel };
          setUserDepartment(departmentInfo);
          if (onDepartmentResolved) {
            onDepartmentResolved(departmentId);
          }
        } else {
          setProfileError('Не удалось определить подразделение текущего пользователя.');
        }
      } catch (error) {
        console.error('Failed to load user profile', error);
        if (isMountedRef.current) {
          setProfileError('Не удалось загрузить профиль пользователя.');
        }
      } finally {
        if (isMountedRef.current) {
          setIsProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [userRole, onDepartmentResolved]);

  return {
    userDepartment,
    isProfileLoading,
    profileError
  };
};
