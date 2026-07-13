import { useTranslation } from 'react-i18next'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Pressione from '@/features/blood-pressure/Pressione'
import MeasurementTab from './MeasurementTab'

export default function Measurements() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="page-header">{t('measurements.title')}</h1>

      <Tabs defaultValue="pressure">
        <TabsList>
          <TabsTrigger value="pressure">{t('measurements.pressureTab')}</TabsTrigger>
          <TabsTrigger value="weight">{t('measurements.weightTab')}</TabsTrigger>
          <TabsTrigger value="glucose">{t('measurements.glucoseTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="pressure" className="mt-6">
          <Pressione />
        </TabsContent>
        <TabsContent value="weight" className="mt-6">
          <MeasurementTab type="weight" />
        </TabsContent>
        <TabsContent value="glucose" className="mt-6">
          <MeasurementTab type="glucose" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
