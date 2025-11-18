import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserProfileApi, updateUserProfileApi } from '../api/authApi'

function Profile({ user, onLogout }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // 편집 상태 관리 (각 필드별로 개별 편집 가능)
  const [editingFields, setEditingFields] = useState({
    name: false,
    email: false,
    phoneNumber: false,
    postalCode: false,
    address: false,
    addressDetail: false,
    password: false
  })

  // 비밀번호 변경 폼 상태
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 임시 수정 데이터
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    postalCode: '',
    address: '',
    addressDetail: ''
  })

  // 사용자 정보 조회
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['userProfile', user.userId],
    queryFn: () => getUserProfileApi(user.userId),
    onSuccess: (data) => {
      // 조회된 데이터로 editData 초기화
      setEditData({
        name: data.user.name || '',
        email: data.user.email || '',
        phoneNumber: data.user.phoneNumber || '',
        postalCode: data.user.postalCode || '',
        address: data.user.address || '',
        addressDetail: data.user.addressDetail || ''
      })
    },
    onError: (error) => {
      console.error('프로필 조회 실패:', error)
      // 백엔드 서버가 없을 경우 로컬 데이터로 폴백
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        postalCode: user.postalCode || '',
        address: user.address || '',
        addressDetail: user.addressDetail || ''
      })
    }
  })

  // 정보 수정 Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updateData) => updateUserProfileApi(user.userId, updateData),
    onSuccess: (data) => {
      alert('정보가 성공적으로 수정되었습니다.')
      // 로컬 스토리지 및 쿼리 캐시 업데이트
      const updatedUser = { ...user, ...data.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      queryClient.setQueryData(['userProfile', user.userId], { user: data.user })

      // 모든 편집 모드 종료
      setEditingFields({
        name: false,
        email: false,
        phoneNumber: false,
        postalCode: false,
        address: false,
        addressDetail: false
      })
    },
    onError: (error) => {
      console.error('프로필 수정 실패:', error)
      alert('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
    }
  })

  // 필드 편집 시작
  const startEditing = (field) => {
    setEditingFields(prev => ({ ...prev, [field]: true }))
  }

  // 필드 편집 취소
  const cancelEditing = (field) => {
    // 원래 데이터로 복원
    setEditData(prev => ({
      ...prev,
      [field]: profileData?.user[field] || ''
    }))
    setEditingFields(prev => ({ ...prev, [field]: false }))
  }

  // 필드 값 변경
  const handleFieldChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  // 비밀번호 폼 값 변경
  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
  }

  // 비밀번호 변경 시작
  const startPasswordEditing = () => {
    setEditingFields(prev => ({ ...prev, password: true }))
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  // 비밀번호 변경 취소
  const cancelPasswordEditing = () => {
    setEditingFields(prev => ({ ...prev, password: false }))
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  // 비밀번호 변경 처리
  const handlePasswordChangeSubmit = async () => {
    // 유효성 검사
    if (!passwordForm.currentPassword) {
      alert('현재 비밀번호를 입력해주세요.')
      return
    }

    if (!passwordForm.newPassword) {
      alert('새 비밀번호를 입력해주세요.')
      return
    }

    if (passwordForm.newPassword.length < 4) {
      alert('새 비밀번호는 최소 4자 이상이어야 합니다.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      // 비밀번호 변경 API 호출 (아직 구현되지 않음)
      const response = await fetch(`http://localhost:8080/api/auth/profile/${user.userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const result = await response.json()

      if (result.code === 'SUCCESS') {
        alert('비밀번호가 성공적으로 변경되었습니다.')
        cancelPasswordEditing()
      } else {
        alert(result.message || '비밀번호 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      alert('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
    }
  }

  // 개별 필드 저장
  const saveField = (field) => {
    const fieldData = { [field]: editData[field] }
    updateProfileMutation.mutate(fieldData)
  }

  // 모든 변경사항 저장
  const saveAllChanges = () => {
    const changedFields = {}
    Object.keys(editData).forEach(field => {
      if (editData[field] !== profileData?.user[field]) {
        changedFields[field] = editData[field]
      }
    })

    if (Object.keys(changedFields).length === 0) {
      alert('변경된 내용이 없습니다.')
      return
    }

    updateProfileMutation.mutate(changedFields)
  }

  // 뒤로가기
  const handleBack = () => {
    navigate(-1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">오류가 발생했습니다: {error.message}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800 p-2"
              >
                ← 뒤로가기
              </button>
              <h1 className="text-xl font-bold text-gray-800">회원정보 수정</h1>
            </div>
            <button
              onClick={onLogout}
              className="text-red-600 hover:text-red-800 px-3 py-1 text-sm border border-red-300 rounded"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              기본 정보
            </h2>

            {/* 이름 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              {editingFields.name ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이름을 입력하세요"
                  />
                  <button
                    onClick={() => saveField('name')}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => cancelEditing('name')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{profileData?.user.name || '미설정'}</span>
                  <button
                    onClick={() => startEditing('name')}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            {/* 이메일 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              {editingFields.email ? (
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="이메일을 입력하세요"
                  />
                  <button
                    onClick={() => saveField('email')}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => cancelEditing('email')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{profileData?.user.email || '미설정'}</span>
                  <button
                    onClick={() => startEditing('email')}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            {/* 휴대폰 번호 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                휴대폰 번호
              </label>
              {editingFields.phoneNumber ? (
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    value={editData.phoneNumber}
                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="휴대폰 번호를 입력하세요"
                  />
                  <button
                    onClick={() => saveField('phoneNumber')}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => cancelEditing('phoneNumber')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{profileData?.user.phoneNumber || '미설정'}</span>
                  <button
                    onClick={() => startEditing('phoneNumber')}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-6 mt-8">
              주소 정보
            </h2>

            {/* 우편번호 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                우편번호
              </label>
              {editingFields.postalCode ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editData.postalCode}
                    onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="우편번호를 입력하세요"
                  />
                  <button
                    onClick={() => saveField('postalCode')}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => cancelEditing('postalCode')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{profileData?.user.postalCode || '미설정'}</span>
                  <button
                    onClick={() => startEditing('postalCode')}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            {/* 주소 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              {editingFields.address ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="주소를 입력하세요"
                  />
                  <button
                    onClick={() => saveField('address')}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => cancelEditing('address')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{profileData?.user.address || '미설정'}</span>
                  <button
                    onClick={() => startEditing('address')}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            {/* 상세 주소 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 주소
              </label>
              {editingFields.addressDetail ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editData.addressDetail}
                    onChange={(e) => handleFieldChange('addressDetail', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="상세 주소를 입력하세요"
                  />
                  <button
                    onClick={() => saveField('addressDetail')}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => cancelEditing('addressDetail')}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{profileData?.user.addressDetail || '미설정'}</span>
                  <button
                    onClick={() => startEditing('addressDetail')}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    수정
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mb-6 mt-8">
              비밀번호 변경
            </h2>

            {/* 비밀번호 변경 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              {editingFields.password ? (
                <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="현재 비밀번호를 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="새 비밀번호를 입력하세요 (최소 4자)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="새 비밀번호를 다시 입력하세요"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePasswordChangeSubmit}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      비밀번호 변경
                    </button>
                    <button
                      onClick={cancelPasswordEditing}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">••••••••</span>
                  <button
                    onClick={startPasswordEditing}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    변경
                  </button>
                </div>
              )}
            </div>

            {/* 읽기 전용 정보 표시 */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                계정 정보
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    아이디
                  </label>
                  <span className="text-gray-900">{profileData?.user.username}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용자 유형
                  </label>
                  <span className="text-gray-900">
                    {profileData?.user.role === 'TAX_ACCOUNTANT' ? '세무사' : '일반회원'}
                  </span>
                </div>

                {profileData?.user.businessNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사업자등록번호
                    </label>
                    <span className="text-gray-900">{profileData.user.businessNumber}</span>
                  </div>
                )}

                {profileData?.user.corporateNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      법인등록번호
                    </label>
                    <span className="text-gray-900">{profileData.user.corporateNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
