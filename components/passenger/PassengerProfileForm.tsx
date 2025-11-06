'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Save,
  Loader2,
  Edit2,
  X,
} from 'lucide-react'
import { updatePassengerProfile } from '@/actions/UpdatePassengerProfile'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/client'
import type { Locale } from '@/i18n/settings'

interface PassengerProfileFormProps {
  user: {
    name: string
    email: string
    phone: string | null
    address: string | null
    city: string | null
    state: string | null
    dateOfBirth: Date | null
    createdAt: Date
  }
  lng: Locale
}

export function PassengerProfileForm({ user, lng }: PassengerProfileFormProps) {
  const { t } = useTranslation(lng, 'dashboard')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split('T')[0]
      : '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    const loadingToast = toast.loading(t('profile.toast.updating'))

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      const result = await updatePassengerProfile(formDataObj)

      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success(t('profile.toast.success'), {
          description: result.message,
          duration: 5000,
        })
        setIsEditing(false)
      } else {
        toast.error(t('profile.toast.error'), {
          description: result.message,
          duration: 5000,
        })
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error(t('profile.toast.error'), {
        description: t('profile.toast.errorDesc'),
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      dateOfBirth: user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split('T')[0]
        : '',
    })
    setIsEditing(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className='max-w-2xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            {t('profile.title')}
          </h1>
          <p className='text-sm text-gray-600 mt-1'>
            {t('profile.subtitle')}
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className='bg-blue-600 hover:bg-blue-700'
          >
            <Edit2 className='w-4 h-4 mr-2' />
            {t('profile.editButton')}
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow-lg p-6 mb-6'>
          {/* Account Info Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <User className='w-5 h-5 text-blue-600' />
              {t('profile.sections.account')}
            </h2>

            {/* Email (Read-only) */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t('profile.fields.email')}
              </label>
              <div className='bg-gray-50 px-4 py-3 rounded-lg border border-gray-200'>
                <p className='text-gray-700'>{user.email}</p>
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                {t('profile.fields.emailNote')}
              </p>
            </div>

            {/* Name */}
            <div className='mb-4'>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                {t('profile.fields.name')}
              </label>
              <input
                id='name'
                name='name'
                type='text'
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing || loading}
                required
                className={`w-full px-4 py-3 rounded-lg border ${
                  isEditing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-200'
                } ${!isEditing || loading ? 'cursor-not-allowed' : ''}`}
                placeholder={t('profile.fields.namePlaceholder')}
              />
            </div>

            {/* Member Since */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                {t('profile.fields.memberSince')}
              </label>
              <div className='bg-gray-50 px-4 py-3 rounded-lg border border-gray-200'>
                <p className='text-gray-700'>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <Phone className='w-5 h-5 text-green-600' />
              {t('profile.sections.contact')}
            </h2>

            {/* Phone */}
            <div className='mb-4'>
              <label
                htmlFor='phone'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                {t('profile.fields.phone')}
              </label>
              <input
                id='phone'
                name='phone'
                type='tel'
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing || loading}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isEditing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-200'
                } ${!isEditing || loading ? 'cursor-not-allowed' : ''}`}
                placeholder={t('profile.fields.phonePlaceholder')}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <MapPin className='w-5 h-5 text-red-600' />
              {t('profile.sections.address')}
            </h2>

            {/* Street Address */}
            <div className='mb-4'>
              <label
                htmlFor='address'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                {t('profile.fields.streetAddress')}
              </label>
              <textarea
                id='address'
                name='address'
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing || loading}
                rows={2}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isEditing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-200'
                } ${!isEditing || loading ? 'cursor-not-allowed' : ''}`}
                placeholder={t('profile.fields.streetPlaceholder')}
              />
            </div>

            {/* City and State */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div>
                <label
                  htmlFor='city'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  {t('profile.fields.city')}
                </label>
                <input
                  id='city'
                  name='city'
                  type='text'
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'bg-gray-50 border-gray-200'
                  } ${!isEditing || loading ? 'cursor-not-allowed' : ''}`}
                  placeholder={t('profile.fields.cityPlaceholder')}
                />
              </div>

              <div>
                <label
                  htmlFor='state'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  {t('profile.fields.state')}
                </label>
                <input
                  id='state'
                  name='state'
                  type='text'
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing || loading}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isEditing
                      ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'bg-gray-50 border-gray-200'
                  } ${!isEditing || loading ? 'cursor-not-allowed' : ''}`}
                  placeholder={t('profile.fields.statePlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div>
            <h2 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <Calendar className='w-5 h-5 text-purple-600' />
              {t('profile.sections.personal')}
            </h2>

            {/* Date of Birth */}
            <div className='mb-4'>
              <label
                htmlFor='dateOfBirth'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                {t('profile.fields.dateOfBirth')}
              </label>
              <input
                id='dateOfBirth'
                name='dateOfBirth'
                type='date'
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing || loading}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isEditing
                    ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    : 'bg-gray-50 border-gray-200'
                } ${!isEditing || loading ? 'cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className='flex gap-3'>
            <Button
              type='submit'
              disabled={loading}
              className='flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold'
            >
              {loading ? (
                <>
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                  {t('profile.buttons.saving')}
                </>
              ) : (
                <>
                  <Save className='w-5 h-5 mr-2' />
                  {t('profile.buttons.save')}
                </>
              )}
            </Button>
            <Button
              type='button'
              onClick={handleCancel}
              disabled={loading}
              variant='outline'
              className='flex-1 h-12'
            >
              <X className='w-5 h-5 mr-2' />
              {t('profile.buttons.cancel')}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

