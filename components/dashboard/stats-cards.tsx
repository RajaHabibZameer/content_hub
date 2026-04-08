'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Package, Clock, Loader2, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface StatsCardsProps {
  productsCount: number
  queuedCount: number
  generatingCount: number
  generatedCount: number
}

export function StatsCards({ productsCount, queuedCount, generatingCount, generatedCount }: StatsCardsProps) {
  const totalQueue = queuedCount + generatingCount + generatedCount

  const stats = [
    { title: 'Total Products', value: productsCount, icon: Package, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { title: 'Queued', value: queuedCount, icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    { title: 'Generating', value: generatingCount, icon: Loader2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { title: 'Generated', value: generatedCount, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  ]

  // Pie chart data for queue status distribution
  const pieData = [
    { name: 'Queued', value: queuedCount, color: '#f59e0b' },
    { name: 'Generating', value: generatingCount, color: '#a855f7' },
    { name: 'Generated', value: generatedCount, color: '#22c55e' },
  ].filter(item => item.value > 0)

  // Bar chart data
  const barData = [
    { name: 'Products', count: productsCount, fill: '#3b82f6' },
    { name: 'Queued', count: queuedCount, fill: '#f59e0b' },
    { name: 'Generating', count: generatingCount, fill: '#a855f7' },
    { name: 'Generated', count: generatedCount, fill: '#22c55e' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart - Queue Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Status Distribution</CardTitle>
            <CardDescription>Current status breakdown of all queue items</CardDescription>
          </CardHeader>
          <CardContent>
            {totalQueue === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                No items in queue yet
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>Products and queue items comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
