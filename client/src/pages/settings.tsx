import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

const Settings = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/user/settings"],
    refetchOnWindowFocus: false,
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("19:00");
  const [weekStartsOn, setWeekStartsOn] = useState("sunday");
  const [theme, setTheme] = useState("light");
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-inter">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences</p>
        </div>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              
              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how Habitify looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="week-starts">Week Starts On</Label>
                <Select value={weekStartsOn} onValueChange={setWeekStartsOn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium">Enable Notifications</h3>
                  <p className="text-sm text-gray-500">Receive reminders for your habits</p>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                <Input 
                  id="reminder-time" 
                  type="time" 
                  value={reminderTime} 
                  onChange={(e) => setReminderTime(e.target.value)}
                  disabled={!notificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium">Streak Alerts</h3>
                  <p className="text-sm text-gray-500">Get notified about your streaks</p>
                </div>
                <Switch defaultChecked={true} disabled={!notificationsEnabled} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium">Weekly Reports</h3>
                  <p className="text-sm text-gray-500">Receive weekly summaries</p>
                </div>
                <Switch defaultChecked={true} disabled={!notificationsEnabled} />
              </div>
              
              <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium">Data Collection</h3>
                  <p className="text-sm text-gray-500">Allow anonymous usage data collection to improve the app</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium">Advertising</h3>
                  <p className="text-sm text-gray-500">Allow personalized ads based on your activity</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-md font-medium mb-2">Data Export</h3>
                <p className="text-sm text-gray-500 mb-4">Download a copy of your data</p>
                <Button variant="outline">Export Data</Button>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Account Deletion</h3>
                <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all data</p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
